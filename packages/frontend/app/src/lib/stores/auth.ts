import { writable } from 'svelte/store'

// Simple browser detection
const browser = typeof window !== 'undefined'

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  bio?: string
  created_at: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

const createAuthStore = () => {
  const { subscribe, set } = writable<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  })

  return {
    subscribe,
    login: (user: User, token: string) => {
      if (browser) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
      set({
        isAuthenticated: true,
        user,
        token
      })
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      set({
        isAuthenticated: false,
        user: null,
        token: null
      })
    },
    initialize: () => {
      if (browser) {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({
              isAuthenticated: true,
              user,
              token
            })
          } catch (error) {
            console.error('Failed to parse stored user data:', error)
            // Clear invalid data
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
          }
        }
      }
    }
  }
}

export const authStore = createAuthStore()