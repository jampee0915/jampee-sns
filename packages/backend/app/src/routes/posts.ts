import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import type { Variables, Bindings } from '../types/hono.js'

const postsRoutes = new Hono<{ Variables: Variables; Bindings: Bindings }>()

const createPostSchema = z.object({
  content: z.string().min(1).max(280),
})

// Get all posts (timeline)
postsRoutes.get('/', async (c) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        users (
          username,
          display_name
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return c.json({ error: 'Failed to fetch posts' }, 500)
    }

    return c.json({ posts })
  } catch (error) {
    console.error('Get posts error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new post
postsRoutes.post('/', authMiddleware, zValidator('json', createPostSchema), async (c) => {
  const { content } = c.req.valid('json')
  const userId = c.get('userId')

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: userId,
      })
      .select(
        `
        *,
        users (
          username,
          display_name
        )
      `
      )
      .single()

    if (error) {
      return c.json({ error: 'Failed to create post' }, 500)
    }

    return c.json({ post })
  } catch (error) {
    console.error('Create post error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user's posts
postsRoutes.get('/user/:username', async (c) => {
  const username = c.req.param('username')

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        users!inner (
          username,
          display_name
        )
      `
      )
      .eq('users.username', username)
      .order('created_at', { ascending: false })

    if (error) {
      return c.json({ error: 'Failed to fetch user posts' }, 500)
    }

    return c.json({ posts })
  } catch (error) {
    console.error('Get user posts error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: XSS - HTMLを直接レンダリング
postsRoutes.get('/preview', async (c) => {
  const content = c.req.query('content')

  // 危険：ユーザー入力をエスケープせずにHTMLとして出力
  return c.html(`
    <html>
      <head>
        <title>Post Preview</title>
      </head>
      <body>
        <h1>Post Preview</h1>
        <div class="post-content">
          ${content}
        </div>
      </body>
    </html>
  `)
})

// VULNERABILITY: CSRF - CSRFトークンのチェックなし
postsRoutes.post('/like/:postId', async (c) => {
  const postId = c.req.param('postId')
  const userId = c.req.header('X-User-ID') // 危険：ヘッダーから直接取得

  try {
    // 危険：認証ミドルウェアを使わず、認証の検証なし
    if (!userId) {
      return c.json({ error: 'User ID required' }, 400)
    }

    const { data: like, error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      return c.json({ error: 'Failed to like post' }, 500)
    }

    return c.json({ like })
  } catch (error) {
    console.error('Like error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: Authorization Bypass - 権限チェック不備
postsRoutes.delete('/:postId', authMiddleware, async (c) => {
  const postId = c.req.param('postId')
  const userId = c.get('userId')

  try {
    // 危険：投稿者本人かどうかチェックしていない
    const { error } = await supabase.from('posts').delete().eq('id', postId)

    if (error) {
      return c.json({ error: 'Failed to delete post' }, 500)
    }

    return c.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: NoSQL Injection - JSONクエリパラメータを直接使用
postsRoutes.get('/search', async (c) => {
  const filters = c.req.query('filters')

  try {
    let query = supabase.from('posts').select('*')

    if (filters) {
      // 危険：ユーザー入力をJSONとしてパースして直接使用
      const parsedFilters = JSON.parse(filters)

      // 危険：フィルタを直接適用（入力検証なし）
      Object.keys(parsedFilters).forEach((key) => {
        query = query.eq(key, parsedFilters[key])
      })
    }

    const { data: posts, error } = await query

    if (error) {
      return c.json({ error: 'Search failed' }, 500)
    }

    return c.json({ posts })
  } catch (error) {
    console.error('Search error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// VULNERABILITY: Information Disclosure - 機密情報の露出
postsRoutes.get('/admin/stats', async (c) => {
  try {
    // 危険：管理者チェックなしで統計情報を返す
    const { data: posts, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        users (
          username,
          display_name,
          email
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      return c.json({ error: 'Failed to fetch stats' }, 500)
    }

    return c.json({
      posts,
      totalPosts: posts.length,
      dbConfig: process.env, // 危険：環境変数を露出
    })
  } catch (error) {
    console.error('Stats error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export { postsRoutes }
