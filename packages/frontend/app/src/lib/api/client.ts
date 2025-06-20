import { authStore } from '$lib/stores/auth'
import { get } from 'svelte/store'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  token: string | null
}

const API_BASE_URL = 'http://localhost:3000/api'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const auth = get(authStore) as AuthState
    return {
      'Content-Type': 'application/json',
      ...(auth.token && { Authorization: `Bearer ${auth.token}` })
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'An error occurred' }
      }

      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      return { error: 'Network error' }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async signup(email: string, password: string, username: string, displayName: string) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName })
    })
  }

  // Posts endpoints
  async getPosts() {
    return this.request<{ posts: any[] }>('/posts')
  }

  async createPost(content: string) {
    return this.request<{ post: any }>('/posts', {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }

  async getUserPosts(username: string) {
    return this.request<{ posts: any[] }>(`/posts/user/${username}`)
  }

  // Users endpoints
  async getUser(username: string) {
    return this.request<{ user: any }>(`/users/${username}`)
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/users/me/profile')
  }
}

export const apiClient = new ApiClient()