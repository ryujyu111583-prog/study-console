# 学習コンソール

統計・投資・ML・英語の毎日を記録する、自分ひとり用のPWA。
family-schedule とは別アプリ・別Firestoreとして動く。家族と共有するものは何も入らない。

## できること

- **今日の記録** — 統計・投資・ML・英語の4項目を「未 / フル / 最低ライン」の3状態でタップ記録。連続日数と直近14日のログ
- **学習タイマー** — 4項目のどれかを選び、30分 / 15分 / 5分ブロック。終了時に自動で記録され、通知が出る
- **誤答台帳** — 誤った概念を「誤りの型」で分類して蓄積。再発項目（2回以上）は翌日から「今日」の画面に自動で出る。3回連続正答で解消
- **スキルツリーと修行** — 下の「スキルツリー」を参照
- **リンク集** — 教材 / TED・ニュース / G検定 / AIニュース
- **朝の通知** — 毎朝6:30（JST）。その日（JST）の記録が4項目のどれか1つでも付いていれば送らない
- **オフライン対応** — 電波がなくても起動して記録でき、復帰時に自動同期される

## スキルツリー（コンテンツごとにカスタムできる）

学習は冒険。仲間（統計・投資・ML・英語）ごとに、出題の形が違う**系統**のスキルツリーを育てる。

| コンテンツ | 系統 |
| --- | --- |
| ML（G検定） | 用語（単語カード）・一問一答・○×・説明・瞬発力 |
| 英語 | 単語（単語カード）・文法（Yes / No）・作文・瞬発力・実践 |
| 統計 | 計算（一問一答）・説明 |
| 投資 | ○×・説明 |

- **ノードを開くと、その問題の束が修行に加わる**。ツリーが育つほど出題が増える
- **修行**の出し方は系統ごとに違う：`card`（めくる）／`qa`（打って自動照合）／`yesno`（○×で自動判定）／`compose`（書いて見本と比べる）／`recall`（口で説明する特技）／`speed`（ほかの系統の問題を制限時間つきで。回答の速さを鍛える）
- 修行の正解で**系統の熟練度 Lv** が上がり、奥のノードを開く鍵になる（SP は従来どおり仲間の Lv から）。報酬は1系統1日20問まで
- 間違えた問題は、その場で**誤答台帳**に入れられる（翌日からモンスターとして出る）
- 系統ごとに**道具**（その力を鍛える外部ツールへのリンク）と、Obsidian ノートへのリンクを持てる

### 新しいコンテンツ・系統を足すには

`src/lib/game/courses/` にデータを書くだけでいい。画面のコードは触らない。

```ts
// courses/ml.ts の一部
{
  id: "ml-term",            // 系統の id（全体で一意）
  name: "用語",
  mode: "card",             // 出し方
  about: "用語を見て、意味を一言で言えるようにする",
  tools: [tool("JDLA G検定 公式ページ")],   // リンク集から名前で引く。直接 { name, host, url, note } を書いてもいい
  mistakeType: "用語止まり",                // 誤答台帳に入れるときの型
  nodes: [
    {
      id: "ml-term-basic", topic: "基本の用語", skill: "用語の書・序", prompt: "8枚",
      cost: 0, requires: [], col: 1, row: 0,   // ツリー上の位置（列0〜2）
      lv: 1,                                   // 開くのに要る系統 Lv（省略可）
      note: "Learning/ML/…",                   // Obsidian ノート（省略可）
      items: [{ q: "過学習", a: "訓練データに合わせすぎて…" }],
      // yesno は { q, ok: true/false, a: 解説 }、qa は accept: ["別解"] も書ける
    },
  ],
},
```

`speed` の系統は `from: ["ml-term", "ml-qa"]` で問題を借り、ノードの `seconds` が段位（制限時間）になる。
id の重複や、前提・`from` の書き間違いは、読み込み時にエラーで止まる。

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
| `studyLog/{YYYY-MM-DD}` | その日の4項目（`stat` / `inv` / `ml` / `en`）の状態と、タイマーで積んだ分数（`statMinutes` など）。旧 `gk` は書き換えず、`ml` が無い日だけ ML として読む |
| `mistakes/{id}` | 誤答台帳。概念・誤りの型・正しい理解・誤答回数・連続正答 |
| `pushSubscriptions/{id}` | この端末のプッシュ購読情報 |

ノートの本体は Obsidian（`ML_learning`）。このアプリは毎日の入口と記録だけを持つ。

旧版が使っていた `settings/main`（受験日・週割り・英語の素材）は今は読まない。消してもよいし残してもよい。
