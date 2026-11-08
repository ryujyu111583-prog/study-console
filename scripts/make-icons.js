// PWA 用アイコンを、元絵 scripts/icon-art/book.webp から作る（2026-11-08〜）。
// 元絵は Hugging Face の FLUX.1 schnell で生成した「魔導書と剣」（seed 7）。作り方と罠は
// vault の knowledge/アイコンと画像素材の作り方 にある。
// 旧版（濃紺に琥珀と青の2本のバーを zlib で描くもの）は廃止。これを実行しても旧アイコンには戻らない。
//
//   node scripts/make-icons.js
//
// 元絵は白い外枠と自前の角丸を描いているので、濃紺の四角だけを切り抜き、角の外を地の色で塗る。
const path = require("node:path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "icon-art", "book.webp");
const OUT = path.join(__dirname, "..", "public", "icons");
const APP = path.join(__dirname, "..", "src", "app");
// 元絵の中の濃紺の四角（512px 中の位置。ふちの白いにじみを避けて 3px 内側）と、その角の半径。地の色は四角の中で測った値
const BOX = { left: 43, top: 42, size: 426 };
const RADIUS = 80;
const BG = { r: 22, g: 37, b: 78 };

async function square() {
  const crop = await sharp(SRC).extract({ left: BOX.left, top: BOX.top, width: BOX.size, height: BOX.size }).png().toBuffer();
  const s = BOX.size;
  // 角丸の内側だけを残すマスク
  const mask = Buffer.from(`<svg width="${s}" height="${s}"><rect width="${s}" height="${s}" rx="${RADIUS}" fill="#fff"/></svg>`);
  const rounded = await sharp(crop).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  return sharp({ create: { width: s, height: s, channels: 4, background: { ...BG, alpha: 1 } } })
    .composite([{ input: rounded }])
    .png()
    .toBuffer();
}

async function main() {
  const art = await square();
  const out = (size, file) => sharp(art).resize(size, size).ensureAlpha().png().toFile(file);
  await out(192, path.join(OUT, "icon-192.png"));
  await out(512, path.join(OUT, "icon-512.png"));
  await out(180, path.join(APP, "apple-icon.png"));
  // favicon は ICO ではなく icon.png（Next.js の規約）。RGBA で書く（RGB の ICO は Vercel のビルドで落ちる）
  await out(48, path.join(APP, "icon.png"));
  // maskable：端末が外周を切り落とすので、絵を 8 割に縮めて周りを地の色にする
  const inner = await sharp(art).resize(410, 410).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: { ...BG, alpha: 1 } } })
    .composite([{ input: inner, left: 51, top: 51 }])
    .png()
    .toFile(path.join(OUT, "icon-maskable-512.png"));
  console.log("icons: 192 / 512 / maskable-512 / apple-icon 180 / icon 48");
}

main();
