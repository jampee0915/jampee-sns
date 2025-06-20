<script lang="ts">
  import { onMount } from 'svelte'

  let userInput = ''
  let searchQuery = ''
  let apiResponse = ''
  let userData: any = {}

  // VULNERABILITY: DOM-based XSS
  function renderUnsafeHtml() {
    const container = document.getElementById('unsafe-html')
    if (container) {
      container.innerHTML = userInput
    }
  }

  // VULNERABILITY: Client-side injection
  function searchUsers() {
    const query = `SELECT * FROM users WHERE name LIKE '%${searchQuery}%'`
    console.log('Executing query:', query)

    try {
      eval(`console.log("Search: ${searchQuery}")`)
    } catch (e) {
      console.error('Query error:', e)
    }
  }

  // VULNERABILITY: Insecure localStorage usage
  function saveUserData() {
    const sensitiveData = {
      username: userData.username,
      password: userData.password,
      creditCard: userData.creditCard,
      apiToken: 'sk-1234567890abcdef',
    }

    localStorage.setItem('userData', JSON.stringify(sensitiveData))
    localStorage.setItem('apiToken', sensitiveData.apiToken)
  }

  // VULNERABILITY: CSRF
  async function performSensitiveAction() {
    try {
      const response = await fetch('http://localhost:3000/api/posts/like/1', {
        method: 'POST',
        headers: {
          'X-User-ID': '1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'like' }),
      })
      apiResponse = await response.text()
    } catch (error: any) {
      apiResponse = 'Error: ' + error.message
    }
  }

  // VULNERABILITY: Eval injection
  function calculateExpression() {
    const element = document.getElementById('calc-input') as HTMLInputElement
    const expression = element?.value || ''

    try {
      const result = eval(expression)
      const resultElement = document.getElementById('calc-result')
      if (resultElement) {
        resultElement.textContent = result
      }
    } catch (error: any) {
      const resultElement = document.getElementById('calc-result')
      if (resultElement) {
        resultElement.textContent = 'Error: ' + error.message
      }
    }
  }

  // VULNERABILITY: Weak random number generation
  function generateToken() {
    const weakToken = Math.random().toString(36).substr(2, 9)
    const tokenElement = document.getElementById('token-display')
    if (tokenElement) {
      tokenElement.textContent = weakToken
    }
    localStorage.setItem('sessionToken', weakToken)
  }

  onMount(() => {
    // VULNERABILITY: Insecure postMessage handling
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.action === 'setHtml') {
          const contentElement = document.getElementById('message-content')
          if (contentElement) {
            contentElement.innerHTML = data.content
          }
        }
        if (data.action === 'eval') {
          eval(data.code)
        }
      } catch (e) {
        console.error('Message handling error:', e)
      }
    })
  })
</script>

<svelte:head>
  <title>脆弱性学習ページ - Jampee SNS</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold text-red-600 mb-6">⚠️ 脆弱性学習ページ</h1>
  <p class="text-red-500 mb-8 p-4 bg-red-50 rounded">
    このページには意図的にセキュリティ脆弱性が含まれています。CodeQL学習目的でのみ使用してください。
  </p>

  <!-- DOM-based XSS -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">DOM-based XSS</h2>
    <input
      bind:value={userInput}
      placeholder="HTMLコードを入力してください"
      class="w-full p-2 border rounded mb-2"
    />
    <button on:click={renderUnsafeHtml} class="bg-red-500 text-white px-4 py-2 rounded">
      危険な描画を実行
    </button>
    <div id="unsafe-html" class="mt-4 p-4 bg-gray-100 rounded"></div>
  </div>

  <!-- Client-side Injection -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">クライアントサイドインジェクション</h2>
    <input
      bind:value={searchQuery}
      placeholder="検索クエリを入力"
      class="w-full p-2 border rounded mb-2"
    />
    <button on:click={searchUsers} class="bg-orange-500 text-white px-4 py-2 rounded">
      危険な検索実行
    </button>
  </div>

  <!-- Insecure Data Storage -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">不安全なデータ保存</h2>
    <input
      bind:value={userData.username}
      placeholder="ユーザー名"
      class="w-full p-2 border rounded mb-2"
    />
    <input
      bind:value={userData.password}
      type="password"
      placeholder="パスワード"
      class="w-full p-2 border rounded mb-2"
    />
    <input
      bind:value={userData.creditCard}
      placeholder="クレジットカード番号"
      class="w-full p-2 border rounded mb-2"
    />
    <button on:click={saveUserData} class="bg-purple-500 text-white px-4 py-2 rounded">
      危険な保存実行
    </button>
  </div>

  <!-- CSRF Vulnerability -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">CSRF脆弱性</h2>
    <button on:click={performSensitiveAction} class="bg-blue-500 text-white px-4 py-2 rounded">
      CSRFトークンなしで機密操作実行
    </button>
    <div class="mt-4 p-2 bg-gray-100 rounded">
      レスポンス: {apiResponse}
    </div>
  </div>

  <!-- Eval Injection -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">Eval インジェクション</h2>
    <input
      id="calc-input"
      placeholder="計算式を入力 (例: 2+2)"
      class="w-full p-2 border rounded mb-2"
    />
    <button on:click={calculateExpression} class="bg-green-500 text-white px-4 py-2 rounded">
      危険な計算実行
    </button>
    <div id="calc-result" class="mt-4 p-2 bg-gray-100 rounded">結果がここに表示されます</div>
  </div>

  <!-- Weak Token Generation -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">弱いトークン生成</h2>
    <button on:click={generateToken} class="bg-yellow-500 text-white px-4 py-2 rounded">
      予測可能なトークン生成
    </button>
    <div id="token-display" class="mt-4 p-2 bg-gray-100 rounded">トークンがここに表示されます</div>
  </div>

  <!-- PostMessage Vulnerability -->
  <div class="mb-8 p-4 border rounded">
    <h2 class="text-xl font-semibold mb-4">PostMessage脆弱性</h2>
    <p class="text-sm text-gray-600 mb-2">開発者ツールのコンソールで以下を実行してください：</p>
    <div class="block p-2 bg-gray-100 rounded text-sm">
      window.postMessage(JSON.stringify(&#123;action:"setHtml",content:"&lt;img src=x
      onerror=alert(1)&gt;"&#125;), '*')
    </div>
    <div id="message-content" class="mt-4 p-2 bg-gray-100 rounded">
      メッセージ内容がここに表示されます
    </div>
  </div>
</div>
