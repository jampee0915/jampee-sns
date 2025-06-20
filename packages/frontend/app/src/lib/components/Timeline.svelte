<script lang="ts">
  import { onMount } from 'svelte'
  import { apiClient } from '$lib/api/client'
  import PostItem from './PostItem.svelte'

  let posts: any[] = []
  let isLoading = true
  let error = ''

  const loadPosts = async () => {
    isLoading = true
    error = ''

    try {
      const result = await apiClient.getPosts()
      
      if (result.error) {
        error = result.error
      } else if (result.data) {
        posts = result.data.posts
      }
    } catch (err) {
      error = 'エラーが発生しました'
    } finally {
      isLoading = false
    }
  }

  onMount(() => {
    loadPosts()
  })

  // Expose refresh function for parent components
  export const refresh = loadPosts
</script>

<div class="bg-white rounded-lg shadow">
  <div class="p-4 border-b">
    <h2 class="text-lg font-semibold">タイムライン</h2>
  </div>

  {#if isLoading}
    <div class="p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">読み込み中...</p>
    </div>
  {:else if error}
    <div class="p-4">
      <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
      <button
        on:click={loadPosts}
        class="mt-2 text-primary-600 hover:text-primary-700 text-sm"
      >
        再読み込み
      </button>
    </div>
  {:else if posts.length === 0}
    <div class="p-8 text-center text-gray-500">
      まだ投稿がありません
    </div>
  {:else}
    <div class="divide-y divide-gray-200">
      {#each posts as post (post.id)}
        <PostItem {post} />
      {/each}
    </div>
  {/if}
</div>

<!-- Listen for new posts event -->