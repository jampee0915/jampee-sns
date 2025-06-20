<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  // Simple browser detection
  const browser = typeof window !== 'undefined'
  import { authStore } from '$lib/stores/auth'

  onMount(() => {
    if (browser) {
      // Initialize auth state from localStorage
      authStore.initialize()
    }
  })
</script>

<div class="min-h-screen bg-gray-50">
  <slot />
</div>