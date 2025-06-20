# Jampee SNS

TwitterのようなSNSアプリケーション。

## 技術スタック

- **バックエンド**: Hono + TypeScript (Node.js)
- **フロントエンド**: SvelteKit + TypeScript + TailwindCSS
- **データベース**: Supabase (PostgreSQL)
- **パッケージ管理**: pnpm workspaces

## プロジェクト構成

```
packages/
├── backend/
│   └── app/              # Honoサーバー
├── frontend/
│   └── app/              # SvelteKitアプリ
├── shared/
│   └── types/            # 共有型定義
└── database/             # Supabaseスキーマ
```

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. Supabaseの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQL Editorで`packages/database/schema.sql`を実行
3. APIキーを取得

### 3. 環境変数の設定

バックエンド用の環境変数を設定：

```bash
# packages/backend/app/.env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

## 開発

### 全サービスを起動

```bash
pnpm dev
```

### 個別サービスの起動

```bash
# バックエンドのみ
pnpm dev:backend

# フロントエンドのみ
pnpm dev:frontend
```

## アクセス

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3000

## 機能

### 実装済み

- ユーザー登録・ログイン
- 投稿作成
- タイムライン表示
- ユーザープロフィール

### 今後の実装予定

- フォロー機能
- いいね機能
- リプライ機能
- リツイート機能

## API エンドポイント

### 認証

- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ログイン

### 投稿

- `GET /api/posts` - タイムライン取得
- `POST /api/posts` - 投稿作成
- `GET /api/posts/user/:username` - ユーザーの投稿取得

### ユーザー

- `GET /api/users/:username` - ユーザープロフィール取得
- `GET /api/users/me/profile` - 現在のユーザー情報取得

## コード品質

```bash
# 型チェック
pnpm type:check

# リンティング
pnpm lint:check
pnpm lint:fix

# フォーマット
pnpm format:check
pnpm format:fix

# テスト
pnpm test
```

## ビルド

```bash
pnpm build
```

## ライセンス

MIT
