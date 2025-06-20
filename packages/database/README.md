# Database Schema

このディレクトリにはSupabase用のデータベーススキーマが含まれています。

## セットアップ手順

1. Supabaseプロジェクトを作成
2. Supabase ダッシュボードのSQL Editorを開く
3. `schema.sql`の内容をコピー&ペーストして実行

## テーブル構成

### users
- ユーザー情報を格納
- メールアドレス、ユーザー名はユニーク
- パスワードはハッシュ化されて保存

### posts
- 投稿情報を格納
- 最大280文字まで
- ユーザーと外部キー関係

### follows (将来実装予定)
- フォロー関係を格納
- 自分自身をフォローできない制約あり

### likes (将来実装予定)
- いいね情報を格納
- ユーザーと投稿の組み合わせでユニーク

## Row Level Security (RLS)

セキュリティポリシーが設定されており、認証されたユーザーのみが自分のデータを更新できます。

## 環境変数

バックエンドで以下の環境変数を設定してください：

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```