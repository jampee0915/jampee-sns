import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(280),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(280)
})

export const PostWithUserSchema = PostSchema.extend({
  users: z.object({
    username: z.string(),
    display_name: z.string()
  })
})

export type Post = z.infer<typeof PostSchema>
export type CreatePost = z.infer<typeof CreatePostSchema>
export type PostWithUser = z.infer<typeof PostWithUserSchema>