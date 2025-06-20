# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Flyle Nexusプロジェクトの技術スタックを模倣したTwitterのようなSNSアプリケーションのサンプルプロジェクトです。3つの主要パッケージからなるpnpmモノレポ構成です：

- **バックエンド**: JWT認証を使用したHono + TypeScript APIサーバー
- **フロントエンド**: SvelteKit + TypeScript + TailwindCSS
- **共有型定義**: フロントエンドとバックエンド間で共有するZodベースの型定義
- **データベース**: RLSポリシーを使用したSupabase PostgreSQL

## 開発コマンド

### セットアップ
```bash
pnpm install          # 全ての依存関係をインストール
```

### 開発
```bash
pnpm dev              # バックエンドとフロントエンドを同時起動
pnpm dev:backend      # バックエンドのみ起動 (ポート3000)
pnpm dev:frontend     # フロントエンドのみ起動 (ポート5173)
```

### コード品質
```bash
pnpm type:check       # 全パッケージのTypeScript型チェック
pnpm lint:check       # ESLintチェック
pnpm lint:fix         # ESLintの自動修正
pnpm format:check     # Prettierフォーマットチェック
pnpm format:fix       # Prettierの自動フォーマット
pnpm test            # 全パッケージのテスト実行
```

### ビルド
```bash
pnpm build           # 全パッケージのビルド
```

## アーキテクチャ

### モノレポ構成
`packages/`以下にpnpm workspacesを使用したパッケージ構成：
- `backend/app/` - Hono APIサーバー (@jampee-sns/backend-app)
- `frontend/app/` - SvelteKitアプリケーション (@jampee-sns/frontend-app)  
- `shared/types/` - 共有TypeScript型定義 (@jampee-sns/shared-types)
- `database/` - Supabaseスキーマとマイグレーション

### バックエンド (Hono)
- メインエントリー: `packages/backend/app/src/index.ts`
- APIルートは`src/routes/`で整理: auth.ts, posts.ts, users.ts
- 認証ミドルウェア: `src/middleware/auth.ts`
- Supabaseクライアント: `src/lib/supabase.ts`
- bcryptjsによるパスワードハッシュ化とJWT認証を使用

### フロントエンド (SvelteKit)
- コンポーネント: `src/lib/components/`（AuthForm, Navigation, PostForm, PostItem, Timeline）
- APIクライアント: `src/lib/api/client.ts`
- 認証ストア: `src/lib/stores/auth.ts`
- スタイリングにTailwindCSSを使用

### データベーススキーマ
`packages/database/schema.sql`に配置。主要テーブル：
- `users` - email, username, display_nameを持つユーザーアカウント
- `posts` - ユーザー投稿（280文字制限）
- `follows` - フォロー関係（将来実装予定）
- `likes` - 投稿のいいね（将来実装予定）

セキュリティにSupabase RLSポリシーを使用。認証はSupabase Authではなく独自JWTを使用。

### 環境変数設定
バックエンドは`packages/backend/app/`に`.env`が必要：
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

## APIエンドポイント

### 認証
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/login` - ユーザーログイン

### 投稿  
- `GET /api/posts` - タイムライン投稿取得
- `POST /api/posts` - 新規投稿作成
- `GET /api/posts/user/:username` - ユーザーの投稿取得

### ユーザー
- `GET /api/users/:username` - ユーザープロフィール取得
- `GET /api/users/me/profile` - 現在のユーザープロフィール取得

## TypeScript設定

ESNextモジュールを使用した厳密なTypeScript設定。`tsconfig.base.json`のベース設定で`noUncheckedIndexedAccess`と`exactOptionalPropertyTypes`を含む厳密な設定を有効化。

## テスト

テストにVitestを使用。ルートまたは個別パッケージから`pnpm test`で実行可能。