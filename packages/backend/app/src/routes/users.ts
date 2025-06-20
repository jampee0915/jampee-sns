import { Hono } from 'hono'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import type { Variables, Bindings } from '../types/hono.js'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const usersRoutes = new Hono<{ Variables: Variables; Bindings: Bindings }>()

// Get user profile
usersRoutes.get('/:username', async (c) => {
  const username = c.req.param('username')

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, bio, created_at')
      .eq('username', username)
      .single()

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Get posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return c.json({
      user: {
        ...user,
        postsCount: postsCount || 0,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get current user profile
usersRoutes.get('/me/profile', authMiddleware, async (c) => {
  const userId = c.get('userId')

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, email, bio, created_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: XSS - エスケープせずにユーザー入力を出力
usersRoutes.get('/hoge', async (c) => {
  const comment = c.req.query('comment')
  return c.html(`<html><body><h1>User comment: ${comment}</h1></body></html>`)
})

// VULNERABILITY: SQL Injection - ユーザー入力を直接SQLクエリに含める
usersRoutes.get('/search', async (c) => {
  const query = c.req.query('q')

  try {
    // 危険：ユーザー入力を直接SQLに組み込み
    const { data: users, error } = await supabase.rpc('search_users_vulnerable', {
      search_query: query,
    })

    if (error) {
      return c.json({ error: 'Search failed' }, 500)
    }

    return c.json({ users })
  } catch (error) {
    console.error('Search error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: Command Injection - ユーザー入力をコマンドに直接使用
usersRoutes.get('/export/:userId', authMiddleware, async (c) => {
  const userId = c.req.param('userId')
  const format = c.req.query('format') || 'json'

  try {
    // 危険：ユーザー入力を直接コマンドに使用
    const command = `echo "Exporting user data for ${userId}" > /tmp/export_${userId}.${format}`

    exec(command, (error) => {
      if (error) {
        console.error('Export error:', error)
      }
    })

    return c.json({ message: 'Export started', userId, format })
  } catch (error) {
    console.error('Export error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: Path Traversal - ファイルパスの適切な検証なし
usersRoutes.get('/avatar/:filename', async (c) => {
  const filename = c.req.param('filename')

  try {
    // 危険：パストラバーサル攻撃が可能
    const filePath = path.join('./uploads/avatars/', filename)
    const fileContent = fs.readFileSync(filePath)

    return c.body(fileContent)
  } catch (error) {
    console.error('Avatar error:', error)
    return c.json({ error: 'File not found' }, 404)
  }
})

// VULNERABILITY: Insecure Direct Object Reference - 権限チェック不足
usersRoutes.get('/admin/user/:id', authMiddleware, async (c) => {
  const targetUserId = c.req.param('id')

  try {
    // 危険：現在のユーザーが管理者かどうかチェックしていない
    const { data: user, error } = await supabase
      .from('users')
      .select('*') // すべての情報を返す（パスワードハッシュも含む）
      .eq('id', targetUserId)
      .single()

    if (error || !user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (error) {
    console.error('Admin get user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: Information Disclosure - エラーメッセージが詳細すぎる
usersRoutes.post('/debug', async (c) => {
  const data = await c.req.json()

  try {
    // 意図的にエラーを発生させてスタックトレースを露出
    const result = JSON.parse(data.invalidJson)
    return c.json({ result })
  } catch (error) {
    // 危険：詳細なエラー情報を返す
    return c.json(
      {
        error: 'Debug error occurred',
        details: (error as Error).message,
        stack: (error as Error).stack,
        data: data,
      },
      500
    )
  }
})

// VULNERABILITY: Weak Authentication - JWT秘密鍵がハードコーディング
usersRoutes.post('/debug-token', async (c) => {
  const userId = c.req.query('userId')

  // 危険：ハードコードされた弱い秘密鍵
  const weakSecret = 'secret123'

  try {
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ userId }, weakSecret, { expiresIn: '1h' })

    return c.json({ token, secret: weakSecret }) // 秘密鍵も返してしまう
  } catch (error) {
    return c.json({ error: 'Token generation failed' }, 500)
  }
})

export { usersRoutes }
