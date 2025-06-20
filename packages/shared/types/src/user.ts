import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  display_name: z.string().min(1).max(50),
  bio: z.string().max(160).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  display_name: z.string().min(1).max(50),
  password: z.string().min(6)
})

export const UpdateUserSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(160).optional()
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>