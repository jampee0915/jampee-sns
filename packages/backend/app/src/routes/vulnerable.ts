import { Hono } from 'hono'
import { supabase } from '../lib/supabase.js'
import type { Variables, Bindings } from '../types/hono.js'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const vulnerableRoutes = new Hono<{ Variables: Variables; Bindings: Bindings }>()

// VULNERABILITY: Remote Code Execution - eval()の使用
vulnerableRoutes.get('/calc', async (c) => {
  const expression = c.req.query('expr')

  try {
    // 極めて危険：ユーザー入力をeval()で実行
    const result = eval(expression)
    return c.json({ result, expression })
  } catch (error) {
    return c.json({ error: 'Calculation failed', details: error.message }, 500)
  }
})

// VULNERABILITY: Server-Side Request Forgery (SSRF)
vulnerableRoutes.get('/fetch', async (c) => {
  const url = c.req.query('url')

  try {
    // 危険：任意のURLにリクエストを送信
    const response = await fetch(url)
    const data = await response.text()

    return c.json({
      url,
      status: response.status,
      data: data.substring(0, 1000), // 最初の1000文字のみ
    })
  } catch (error) {
    return c.json({ error: 'Fetch failed', url }, 500)
  }
})

// VULNERABILITY: XML External Entity (XXE) - XMLパーサーの設定不備
vulnerableRoutes.post('/xml', async (c) => {
  const xmlData = await c.req.text()

  try {
    // 危険：外部エンティティを許可するXMLパーサー（疑似コード）
    const DOMParser = require('xmldom').DOMParser
    const parser = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: () => {},
        fatalError: () => {},
      },
    })

    const doc = parser.parseFromString(xmlData, 'text/xml')
    const serializer = require('xmldom').XMLSerializer
    const result = new serializer().serializeToString(doc)

    return c.json({ parsedXml: result })
  } catch (error) {
    return c.json({ error: 'XML parsing failed', details: error.message }, 500)
  }
})

// VULNERABILITY: Insecure Deserialization
vulnerableRoutes.post('/deserialize', async (c) => {
  const serializedData = await c.req.text()

  try {
    // 危険：信頼できないデータをデシリアライズ
    const obj = JSON.parse(serializedData)

    // さらに危険：オブジェクトのプロパティを直接実行
    if (obj.action && typeof obj.action === 'string') {
      const action = eval(obj.action) // RCE脆弱性
      return c.json({ result: action, data: obj })
    }

    return c.json({ deserialized: obj })
  } catch (error) {
    return c.json({ error: 'Deserialization failed', details: error.message }, 500)
  }
})

// VULNERABILITY: Weak Cryptography - 弱い暗号化
vulnerableRoutes.post('/encrypt', async (c) => {
  const { data } = await c.req.json()

  // 危険：弱いアルゴリズムと固定キー
  const crypto = require('crypto')
  const algorithm = 'des' // 弱い暗号化アルゴリズム
  const key = 'weak123' // 固定・弱いキー

  try {
    const cipher = crypto.createCipher(algorithm, key)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return c.json({
      encrypted,
      algorithm,
      key, // 危険：キーも返してしまう
    })
  } catch (error) {
    return c.json({ error: 'Encryption failed' }, 500)
  }
})

// VULNERABILITY: Directory Traversal + Local File Inclusion
vulnerableRoutes.get('/include', async (c) => {
  const filename = c.req.query('file')

  try {
    // 危険：入力検証なしでファイルを読み込み
    const filePath = path.join('./src/', filename)
    const content = fs.readFileSync(filePath, 'utf8')

    // さらに危険：JavaScriptファイルの場合は実行
    if (filename.endsWith('.js')) {
      const result = eval(content)
      return c.json({ content, executed: result })
    }

    return c.json({ content })
  } catch (error) {
    return c.json(
      {
        error: 'File access failed',
        file: filename,
        details: error.message,
      },
      500
    )
  }
})

// VULNERABILITY: Race Condition
let counter = 0
vulnerableRoutes.post('/counter', async (c) => {
  // 危険：非同期処理でのレースコンディション
  const currentValue = counter

  // 意図的な遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 100))

  counter = currentValue + 1

  return c.json({ counter, previousValue: currentValue })
})

// VULNERABILITY: Memory Leak - 大量のデータを保持
const memoryLeak = []
vulnerableRoutes.post('/memory-leak', async (c) => {
  const { size = 1000 } = await c.req.json()

  // 危険：メモリリークを意図的に作成
  const data = new Array(size).fill('x'.repeat(1000))
  memoryLeak.push(...data)

  return c.json({
    message: 'Data added to memory',
    totalSize: memoryLeak.length,
    memoryUsage: process.memoryUsage(),
  })
})

// VULNERABILITY: Prototype Pollution
vulnerableRoutes.post('/merge', async (c) => {
  const input = await c.req.json()

  // 危険：プロトタイプ汚染を引き起こす可能性
  function merge(target, source) {
    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {}
        merge(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
    return target
  }

  const result = {}
  merge(result, input)

  return c.json({ merged: result, prototype: Object.prototype })
})

export { vulnerableRoutes }
