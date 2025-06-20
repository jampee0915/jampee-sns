import { Next } from 'hono'
import jwt from 'jsonwebtoken'
import { AppContext } from '../types/hono.js'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

interface JWTPayload {
  userId: string
  iat: number
  exp: number
}

export const authMiddleware = async (c: AppContext, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.slice(7) // Remove 'Bearer ' prefix

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    c.set('userId', payload.userId)
    return await next()
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}