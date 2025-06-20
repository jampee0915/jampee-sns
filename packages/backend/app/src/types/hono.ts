import { Context } from 'hono'

export interface Variables {
  userId: string
}

export interface Bindings {}

export type AppContext = Context<{ Variables: Variables; Bindings: Bindings }>