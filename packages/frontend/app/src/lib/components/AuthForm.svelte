<script lang="ts">
  import { authStore } from '$lib/stores/auth'
  import { apiClient } from '$lib/api/client'

  let isLogin = true
  let email = ''
  let password = ''
  let username = ''
  let displayName = ''
  let isLoading = false
  let error = ''

  const handleSubmit = async () => {
    if (isLoading) return
    
    error = ''
    isLoading = true

    try {
      const result = isLogin 
        ? await apiClient.login(email, password)
        : await apiClient.signup(email, password, username, displayName)

      if (result.error) {
        error = result.error
      } else if (result.data) {
        authStore.login(result.data.user, result.data.token)
      }
    } catch (err) {
      error = 'エラーが発生しました'
    } finally {
      isLoading = false
    }
  }

  const resetForm = () => {
    error = ''
    email = ''
    password = ''
    username = ''
    displayName = ''
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <div class="flex mb-6">
    <button
      class="flex-1 py-2 text-center border-b-2 {isLogin ? 'border-primary-500 text-primary-600' : 'border-gray-200 text-gray-500'}"
      on:click={() => {
        isLogin = true
        resetForm()
      }}
    >
      ログイン
    </button>
    <button
      class="flex-1 py-2 text-center border-b-2 {!isLogin ? 'border-primary-500 text-primary-600' : 'border-gray-200 text-gray-500'}"
      on:click={() => {
        isLogin = false
        resetForm()
      }}
    >
      新規登録
    </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    {/if}

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        メールアドレス
      </label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="email@example.com"
      />
    </div>

    {#if !isLogin}
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
          ユーザー名
        </label>
        <input
          id="username"
          type="text"
          bind:value={username}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="username"
        />
      </div>

      <div>
        <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
          表示名
        </label>
        <input
          id="displayName"
          type="text"
          bind:value={displayName}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="表示名"
        />
      </div>
    {/if}

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        パスワード
      </label>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        minlength="6"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="6文字以上"
      />
    </div>

    <button
      type="submit"
      disabled={isLoading}
      class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if isLoading}
        処理中...
      {:else}
        {isLogin ? 'ログイン' : '新規登録'}
      {/if}
    </button>
  </form>
</div>