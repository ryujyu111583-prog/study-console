# 学習コンソール

G検定と英語の毎日を記録する、自分ひとり用のPWA。
family-schedule とは別アプリ・別Firestoreとして動く。家族と共有するものは何も入らない。

## できること

- **今日の記録** — G検定と英語を「未 / フル / 最低ライン」の3状態でタップ記録。連続日数と直近14日のログ
- **学習タイマー** — 30分（G検定）/ 15分（英語）/ 5分ブロック。終了時に自動で記録され、通知が出る
- **誤答台帳** — 誤った概念を「誤りの型」で分類して蓄積。再発項目（2回以上）は翌日から「今日」の画面に自動で出る。3回連続正答で解消
- **週割り** — 受験日までの7週。今週の行がハイライトされ、英語の素材を週ごとに記録できる
- **リンク集** — 教材 / TED・ニュース / G検定 / AIニュース
- **朝の通知** — 毎朝6:30（JST）。前日ぶんの記録が付いている日は送らない
- **オフライン対応** — 電波がなくても起動して記録でき、復帰時に自動同期される

## セットアップ

### 1. Firebaseプロジェクトを作成

family-schedule とは**別のプロジェクト**を作る（データを混ぜないため）。

1. [Firebase Console](https://console.firebase.google.com/) で新規プロジェクトを作成（無料のSparkプランでよい）
2. 「Authentication」→「Sign-in method」で **Google** を有効化
3. 「Firestore Database」を作成
4. 「プロジェクトの設定」→「マイアプリ」でWebアプリを追加し、設定値をコピー

### 2. 環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` に Firebase の設定値と、自分のGmailアドレス（`NEXT_PUBLIC_ALLOWED_EMAIL`）を入れる。

VAPIDキーは次で生成する。

```bash
npx web-push generate-vapid-keys
```

出てきた公開鍵を `NEXT_PUBLIC_VAPID_PUBLIC_KEY`、秘密鍵を `VAPID_PRIVATE_KEY` に入れる。
`CRON_SECRET` は自分で決めた適当な文字列でよい。
`FIREBASE_SERVICE_ACCOUNT_KEY` は Firebase Console →「プロジェクトの設定」→「サービスアカウント」で生成したJSONを、**1行にして**貼る。

### 3. Firestoreのルール

`firestore.rules` の中のメールアドレスが自分のものになっているか確認し、
Firebase Console の Firestore「ルール」タブに貼り付けて公開する。

このルールが効いていないと、URLを知った誰でも読み書きできてしまう。**必ず先に入れること。**

### 4. 起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開いてGoogleログインする。

通知をローカルで試す場合はHTTPSが要る。

```bash
npm run dev -- --experimental-https
```

## デプロイ（Vercel）

1. このリポジトリをVercelでImport
2. 環境変数に `.env.local` と同じ内容を登録（`FIREBASE_SERVICE_ACCOUNT_KEY` と `VAPID_PRIVATE_KEY`、`CRON_SECRET` も忘れずに）
3. デプロイ後のURLをスマホで開き、ホーム画面に追加
4. 追加したアイコンから開き直して、「設定」→「この端末で通知を受け取る」

`vercel.json` の cron が `/api/send-reminders` を毎日 UTC 21:30（JST 6:30）に叩く。
Vercel の cron は `CRON_SECRET` を `Authorization: Bearer` で自動的に送る設定が要るので、
Vercel の Cron Jobs 設定で環境変数が渡っているか確認する。

### iPhoneでの注意

iOSは**ホーム画面に追加したあと、そのアイコンから開いた場合のみ**プッシュ通知を登録できる。
Safariのタブで開いたままでは「設定」の通知ボタンが効かないので、先に追加すること。

## データの置き場所

| コレクション | 中身 |
|---|---|
| `settings/main` | 受験日、終わった週、週ごとの英語の素材 |
| `studyLog/{YYYY-MM-DD}` | その日の2トラックの状態と、タイマーで積んだ分数 |
| `mistakes/{id}` | 誤答台帳。概念・誤りの型・正しい理解・誤答回数・連続正答 |
| `pushSubscriptions/{id}` | この端末のプッシュ購読情報 |

ノートの本体は Obsidian（`ML_learning`）。このアプリは毎日の入口と記録だけを持つ。

## 週割りを変えるとき

`src/lib/plan.ts` の `WEEKS` と `PLAN_START` を編集する。
受験日そのものはアプリの「計画」画面から変えられる。
