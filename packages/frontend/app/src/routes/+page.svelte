<script lang="ts">
  import { authStore } from '$lib/stores/auth'
  import Timeline from '$lib/components/Timeline.svelte'
  import PostForm from '$lib/components/PostForm.svelte'
  import Navigation from '$lib/components/Navigation.svelte'
  import AuthForm from '$lib/components/AuthForm.svelte'

  $: isAuthenticated = $authStore.isAuthenticated
</script>

<svelte:head>
  <title>Jampee SNS</title>
  <meta name="description" content="TwitterのようなSNSアプリケーション" />
</svelte:head>

{#if isAuthenticated}
  <div class="max-w-6xl mx-auto">
    <Navigation />
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <!-- Left sidebar -->
      <div class="hidden md:block">
        <div class="bg-white rounded-lg shadow p-4">
          <h2 class="text-lg font-semibold mb-4">プロフィール</h2>
          {#if $authStore.user}
            <div class="space-y-2">
              <p class="font-medium">{$authStore.user.display_name}</p>
              <p class="text-gray-600">@{$authStore.user.username}</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Main content -->
      <div class="md:col-span-2 space-y-6">
        <PostForm />
        <Timeline />
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Jampee SNS</h1>
        <p class="text-gray-600">今起きていることを共有しよう</p>
      </div>
      <AuthForm />
    </div>
  </div>
{/if}