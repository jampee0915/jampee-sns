import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Variables, Bindings } from './types/hono.js'

import { authRoutes } from './routes/auth.js'
import { postsRoutes } from './routes/posts.js'
import { usersRoutes } from './routes/users.js'

const app = new Hono<{ Variables: Variables; Bindings: Bindings }>()

// Middleware
app.use('*', cors({
  origin: 'http://localhost:5173', // SvelteKit dev server
  credentials: true,
}))
app.use('*', logger())

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Jampee SNS API is running!' })
})

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/posts', postsRoutes)
app.route('/api/users', usersRoutes)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})