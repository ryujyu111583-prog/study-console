// PWA用アイコンを生成する。外部ライブラリを使わず、zlibだけでPNGを書き出す。
// 図案: 濃紺の地に、G検定(琥珀)と英語(青)の2本のバー。計器盤の意匠に合わせている。
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const BG = [12, 18, 23];
const GK = [238, 138, 72];
const EN = [107, 166, 238];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/** 角丸長方形の内側かどうか。 */
function inRoundedRect(x, y, left, top, width, height, radius) {
  if (x < left || x >= left + width || y < top || y >= top + height) return false;
  const dx = Math.min(x - left, left + width - 1 - x);
  const dy = Math.min(y - top, top + height - 1 - y);
  if (dx >= radius || dy >= radius) return true;
  const cx = radius - dx;
  const cy = radius - dy;
  return cx * cx + cy * cy <= radius * radius;
}

function render(size) {
  const barWidth = Math.round(size * 0.56);
  const barHeight = Math.round(size * 0.13);
  const gap = Math.round(size * 0.1);
  const left = Math.round((size - barWidth) / 2);
  const topGk = Math.round(size / 2 - gap / 2 - barHeight);
  const topEn = Math.round(size / 2 + gap / 2);
  const radius = Math.round(barHeight / 2);

  const raw = Buffer.alloc(size * (size * 4 + 1));
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter type: None
    for (let x = 0; x < size; x++) {
      let color = BG;
      if (inRoundedRect(x, y, left, topGk, barWidth, barHeight, radius)) color = GK;
      else if (inRoundedRect(x, y, left, topEn, barWidth, barHeight, radius)) color = EN;
      raw[offset++] = color[0];
      raw[offset++] = color[1];
      raw[offset++] = color[2];
      raw[offset++] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
for (const size of [192, 512]) {
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, render(size));
  console.log("wrote", file);
}
