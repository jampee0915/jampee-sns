<script lang="ts">
  import { onMount } from 'svelte'

  export let userContent = ''
  export let apiEndpoint = ''

  let sensitiveData = {
    apiKey: 'sk-1234567890abcdef',
    adminToken: 'admin_token_123456',
    databaseUrl: 'postgresql://user:password@localhost:5432/db',
  }

  // VULNERABILITY: innerHTML usage without sanitization
  function renderContent(content: string) {
    const element = document.querySelector('.content-display')
    if (element) {
      // 危険：サニタイゼーションなしでHTML挿入
      element.innerHTML = content
    }
  }

  // VULNERABILITY: Insecure API call with user input
  async function makeApiCall(endpoint: string) {
    try {
      // 危険：ユーザー入力を直接URLに使用
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${sensitiveData.apiKey}`, // 危険：API キーを露出
          'X-Admin-Token': sensitiveData.adminToken,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API call failed:', error)
      // 危険：エラーに機密情報が含まれる可能性
      throw new Error(`API call failed: ${error.message}. Using endpoint: ${endpoint}`)
    }
  }

  // VULNERABILITY: Global variable pollution
  function exposeGlobalData() {
    // 危険：機密データをグローバルスコープに露出
    ;(window as any).sensitiveData = sensitiveData
    ;(window as any).makeApiCall = makeApiCall
    ;(window as any).renderContent = renderContent
  }

  // VULNERABILITY: Unsafe event handler
  function handleUnsafeClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    const action = target.getAttribute('data-action')

    if (action) {
      // 危険：属性値を直接eval
      try {
        eval(action)
      } catch (error) {
        console.error('Action execution failed:', error)
      }
    }
  }

  onMount(() => {
    exposeGlobalData()

    // VULNERABILITY: Unsafe message listener
    window.addEventListener('message', (event) => {
      // 危険：origin検証なしでメッセージを処理
      const { type, data } = event.data

      switch (type) {
        case 'EXECUTE_CODE':
          eval(data.code)
          break
        case 'UPDATE_CONTENT':
          renderContent(data.content)
          break
        case 'API_CALL':
          makeApiCall(data.endpoint)
          break
      }
    })
  })
</script>

<div class="vulnerable-component p-4 border rounded bg-red-50">
  <h3 class="text-lg font-semibold text-red-700 mb-4">脆弱なコンポーネント</h3>

  <div class="mb-4">
    <label class="block text-sm font-medium mb-2">危険なコンテンツ表示:</label>
    <input
      bind:value={userContent}
      placeholder="HTMLコンテンツを入力"
      class="w-full p-2 border rounded"
    />
    <button
      on:click={() => renderContent(userContent)}
      class="mt-2 bg-red-500 text-white px-4 py-2 rounded"
    >
      安全でない描画
    </button>
    <div class="content-display mt-2 p-2 bg-white border rounded min-h-[50px]"></div>
  </div>

  <div class="mb-4">
    <label class="block text-sm font-medium mb-2">危険なAPIコール:</label>
    <input
      bind:value={apiEndpoint}
      placeholder="API エンドポイントを入力"
      class="w-full p-2 border rounded"
    />
    <button
      on:click={() => makeApiCall(apiEndpoint)}
      class="mt-2 bg-orange-500 text-white px-4 py-2 rounded"
    >
      API呼び出し実行
    </button>
  </div>

  <div class="mb-4">
    <p class="text-sm text-gray-600 mb-2">危険なクリックハンドラー:</p>
    <button
      class="bg-purple-500 text-white px-4 py-2 rounded"
      data-action="alert('XSS executed!')"
      on:click={handleUnsafeClick}
    >
      危険なボタン
    </button>
  </div>

  <div class="text-xs text-gray-500">
    <p>機密データがwindow.sensitiveDataに露出されています</p>
    <p>開発者ツールで確認してください</p>
  </div>
</div>
