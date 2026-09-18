export type LinkItem = {
  name: string;
  host: string;
  url: string;
  note: string;
};

export type LinkGroup = {
  id: string;
  label: string;
  items: LinkItem[];
};

export const LINK_GROUPS: LinkGroup[] = [
  {
    id: "material",
    label: "教材",
    items: [
      {
        name: "BBC Learning English",
        host: "bbc.co.uk",
        url: "https://www.bbc.co.uk/learningenglish",
        note: "音声とスクリプトが揃う。シャドーイングの本命。6 Minute English を1週間1本で回す",
      },
      {
        name: "6 Minute English（Podcast）",
        host: "podcasts.apple.com",
        url: "https://podcasts.apple.com/us/podcast/6-minute-english/id262026947",
        note: "落としておけば電波が切れても回る。通勤枠はこちら",
      },
      {
        name: "6 Minute English（YouTube）",
        host: "youtube.com",
        url: "https://www.youtube.com/playlist?list=PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt",
        note: "字幕付きで観たい日に。毎週木曜に新作",
      },
      {
        name: "VOA Learning English",
        host: "voanews.com",
        url: "https://learningenglish.voanews.com/",
        note: "ゆっくりめ。BBCが速すぎる週の逃げ道",
      },
      {
        name: "ELLLO",
        host: "elllo.org",
        url: "https://www.elllo.org/",
        note: "自然な会話が中心。話者の訛りが多様で実戦的",
      },
      {
        name: "News in Levels",
        host: "newsinlevels.com",
        url: "https://www.newsinlevels.com/",
        note: "同じニュースが3段階の難度で読める。level 3 が中級の目安",
      },
      {
        name: "Breaking News English",
        host: "breakingnewsenglish.com",
        url: "https://breakingnewsenglish.com/",
        note: "1本に音声と練習問題がぶら下がる。演習枠向き",
      },
      {
        name: "YouGlish",
        host: "youglish.com",
        url: "https://youglish.com/",
        note: "単語を実際の動画で発音確認。発音記号より速くて正確",
      },
      {
        name: "英辞郎 on the WEB",
        host: "alc.co.jp",
        url: "https://eow.alc.co.jp/",
        note: "用例が多い。瞬間英作文で詰まったときに",
      },
      {
        name: "Weblio 英和・和英辞典",
        host: "weblio.jp",
        url: "https://ejje.weblio.jp/",
        note: "語彙の一次確認。スマホでも軽い",
      },
    ],
  },
  {
    id: "ted",
    label: "TED・ニュース",
    items: [
      {
        name: "TED Talks",
        host: "ted.com",
        url: "https://www.ted.com/talks",
        note: "全トークに書き起こしと字幕。話者を選べば中級でも通る",
      },
      {
        name: "TED Talks Daily",
        host: "ted.com",
        url: "https://www.ted.com/podcasts/ted-talks-daily",
        note: "平日毎日、最新トークが音声で届く。ながら枠に",
      },
      {
        name: "TED-Ed",
        host: "ed.ted.com",
        url: "https://ed.ted.com/",
        note: "5分前後のアニメ解説。TED本体より短く速度も安定",
      },
      {
        name: "CNN 10",
        host: "cnn.com",
        url: "https://www.cnn.com/cnn10",
        note: "1日10分のニュース番組。もともと学習者向けに作られている",
      },
      {
        name: "CNN 10（Podcast）",
        host: "podcasts.apple.com",
        url: "https://podcasts.apple.com/us/podcast/cnn-10/id1766786641",
        note: "同じものを音声で。落として持ち出せる",
      },
      {
        name: "The Japan Times Alpha",
        host: "japantimes.co.jp",
        url: "https://alpha.japantimes.co.jp/",
        note: "日本人学習者向けの週刊英字新聞。記事ごとにレベル表示と語注。有料",
      },
      {
        name: "NHK WORLD-JAPAN",
        host: "nhk.or.jp",
        url: "https://www3.nhk.or.jp/nhkworld/",
        note: "知っている日本のニュースを英語で。背景が分かる分、音に集中できる",
      },
      {
        name: "BBC News",
        host: "bbc.com",
        url: "https://www.bbc.com/news",
        note: "手加減のない本物。Learning Englishの次の階段",
      },
      {
        name: "NPR",
        host: "npr.org",
        url: "https://www.npr.org/",
        note: "アメリカ英語の耳を作りたいとき。多くの記事に音声が付く",
      },
    ],
  },
  {
    id: "gken",
    label: "G検定",
    items: [
      {
        name: "JDLA G検定 公式ページ",
        host: "jdla.org",
        url: "https://www.jdla.org/certificate/general/",
        note: "シラバスと例題の一次情報。出題範囲はここを唯一の基準にする",
      },
      {
        name: "Study-AI G検定模擬テスト",
        host: "study-ai.com",
        url: "https://study-ai.com/generalist/",
        note: "無料の模擬テスト。300問超で120分の本番形式。登録が要る",
      },
      {
        name: "JDLA 学習コンテンツ紹介",
        host: "jdla.org",
        url: "https://www.jdla.org/recommendedbook/study/",
        note: "協会が挙げている教材と、一部無料で使えるもののまとめ",
      },
      {
        name: "AI事業者ガイドライン 第1.2版",
        host: "meti.go.jp",
        url: "https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/20260331_report.html",
        note: "2026年3月31日公表の最新版。W6の中核。旧1.0／1.1版と混ぜない",
      },
      {
        name: "文化庁 AIと著作権について",
        host: "bunka.go.jp",
        url: "https://www.bunka.go.jp/seisaku/chosakuken/aiandcopyright.html",
        note: "「考え方について」とチェックリスト。30条の4まわりは頻出",
      },
      {
        name: "個人情報保護委員会",
        host: "ppc.go.jp",
        url: "https://www.ppc.go.jp/",
        note: "W6の法規パート。個人情報保護法の一次情報",
      },
    ],
  },
  {
    id: "ainews",
    label: "AIニュース",
    items: [
      {
        name: "ITmedia AI+",
        host: "itmedia.co.jp",
        url: "https://www.itmedia.co.jp/aiplus/",
        note: "日本語のAIニュースを毎日拾うならここ。動向問題の素地になる",
      },
      {
        name: "Ledge.ai",
        host: "ledge.ai",
        url: "https://ledge.ai/",
        note: "国内のAI導入事例が中心。社会実装パートの具体例に使える",
      },
      {
        name: "MIT Technology Review 日本版",
        host: "technologyreview.jp",
        url: "https://www.technologyreview.jp/",
        note: "倫理・社会影響の議論が厚い。ELSI系の設問に効く",
      },
      {
        name: "Anthropic News",
        host: "anthropic.com",
        url: "https://www.anthropic.com/news",
        note: "一次情報。安全性の考え方はそのまま倫理パートの材料になる",
      },
      {
        name: "Google The Keyword — AI",
        host: "blog.google",
        url: "https://blog.google/technology/ai/",
        note: "一次情報。Transformer以降の系譜を出している側の発表",
      },
      {
        name: "Hugging Face",
        host: "huggingface.co",
        url: "https://huggingface.co/",
        note: "モデルの実物が並ぶ。名前だけ覚えた用語に実体を与えられる",
      },
      {
        name: "arXiv cs.LG",
        host: "arxiv.org",
        url: "https://arxiv.org/list/cs.LG/recent",
        note: "試験には直結しないが動向の肌感が作れる。タイトルを眺めるだけでよい",
      },
    ],
  },
];
