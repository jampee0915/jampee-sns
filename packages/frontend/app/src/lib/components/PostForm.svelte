<script lang="ts">
  import { apiClient } from '$lib/api/client'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let content = ''
  let isLoading = false
  let error = ''

  const MAX_CHARS = 280

  $: remainingChars = MAX_CHARS - content.length
  $: isOverLimit = remainingChars < 0

  const handleSubmit = async () => {
    if (isLoading || !content.trim() || isOverLimit) return

    error = ''
    isLoading = true

    try {
      const result = await apiClient.createPost(content.trim())
      
      if (result.error) {
        error = result.error
      } else {
        content = ''
        dispatch('posted')
      }
    } catch (err) {
      error = 'エラーが発生しました'
    } finally {
      isLoading = false
    }
  }
</script>

<div class="bg-white rounded-lg shadow p-6">
  <h2 class="text-lg font-semibold mb-4">投稿する</h2>
  
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-4">
      <textarea
        bind:value={content}
        placeholder="今何してる？"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        maxlength={MAX_CHARS + 10}
      ></textarea>
      
      <div class="flex items-center justify-between mt-2">
        <div class="text-sm {isOverLimit ? 'text-red-500' : remainingChars < 20 ? 'text-yellow-600' : 'text-gray-500'}">
          {remainingChars} 文字
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !content.trim() || isOverLimit}
          class="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if isLoading}
            投稿中...
          {:else}
            投稿
          {/if}
        </button>
      </div>
    </div>
  </form>
</div>