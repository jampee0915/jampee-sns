<script lang="ts">
  export let post: {
    id: string
    content: string
    created_at: string
    users: {
      username: string
      display_name: string
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}秒前`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分前`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}時間前`
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
</script>

<article class="p-4 hover:bg-gray-50 transition-colors">
  <div class="flex space-x-3">
    <!-- Avatar placeholder -->
    <div class="flex-shrink-0">
      <div class="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
        <span class="text-primary-600 font-medium text-sm">
          {post.users.display_name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center space-x-2">
        <h3 class="text-sm font-medium text-gray-900 truncate">
          {post.users.display_name}
        </h3>
        <span class="text-sm text-gray-500">
          @{post.users.username}
        </span>
        <span class="text-sm text-gray-500">·</span>
        <time class="text-sm text-gray-500" datetime={post.created_at}>
          {formatDate(post.created_at)}
        </time>
      </div>

      <!-- Content -->
      <div class="mt-1">
        <p class="text-gray-900 whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      <!-- Actions placeholder -->
      <div class="mt-3 flex items-center space-x-6">
        <button class="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-sm">返信</span>
        </button>
        
        <button class="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="text-sm">リツイート</span>
        </button>
        
        <button class="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span class="text-sm">いいね</span>
        </button>
      </div>
    </div>
  </div>
</article>