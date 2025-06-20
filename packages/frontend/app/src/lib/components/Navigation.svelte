<script lang="ts">
  import { authStore } from '$lib/stores/auth'

  const handleLogout = () => {
    authStore.logout()
  }
</script>

<nav class="bg-white shadow-sm border-b">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-primary-600">Jampee SNS</h1>
      </div>

      <div class="flex items-center space-x-4">
        {#if $authStore.user}
          <span class="text-gray-700">
            こんにちは、{$authStore.user.display_name}さん
          </span>
        {/if}
        <button
          on:click={handleLogout}
          class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          ログアウト
        </button>
      </div>
    </div>
  </div>
</nav>