import { Hono } from 'hono'
import { supabase } from '../lib/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import type { Variables, Bindings } from '../types/hono.js'

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

usersRoutes.get('/hoge', async (c) => {
  return c.html(`<script>alert("hoge")</script>`)
})

export { usersRoutes }
