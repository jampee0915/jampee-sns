import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import type { Variables, Bindings } from '../types/hono.js'

const postsRoutes = new Hono<{ Variables: Variables; Bindings: Bindings }>()

const createPostSchema = z.object({
  content: z.string().min(1).max(280)
})

// Get all posts (timeline)
postsRoutes.get('/', async (c) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (
          username,
          display_name
        )
      `)
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
        user_id: userId
      })
      .select(`
        *,
        users (
          username,
          display_name
        )
      `)
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
      .select(`
        *,
        users!inner (
          username,
          display_name
        )
      `)
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

export { postsRoutes }