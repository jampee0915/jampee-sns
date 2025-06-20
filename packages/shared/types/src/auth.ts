import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(20),
  displayName: z.string().min(1).max(50)
})

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    display_name: z.string(),
    bio: z.string().optional(),
    created_at: z.string().datetime()
  }),
  token: z.string()
})

export type LoginRequest = z.infer<typeof LoginSchema>
export type SignupRequest = z.infer<typeof SignupSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>