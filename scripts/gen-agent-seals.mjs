#!/usr/bin/env node
/**
 * Generate 5 decorative agent-themed seals/badges.
 * Usage:
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-agent-seals.mjs
 *   node scripts/gen-agent-seals.mjs compass-rose hud-seal  # subset
 */
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {generateImage} from '../../vertex-mcp-server/src/vertex-client.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../web/public/generated');
if (!existsSync(outDir)) mkdirSync(outDir, {recursive: true});

const COMMON =
  '。正方形 1:1 构图，主体居中，纯白 #ffffff 背景便于扣图，无文字无水印，全龄卡通粗黑描边、扁平鲜艳填充，主体填充画面约 80%，柔和光影。';

const SLOTS = [
  {
    slotKey: 'compass-rose',
    prompt:
      '一枚特工地图罗盘玫瑰，四向尖角星形指针，琥珀金主色配深棕轮廓与象牙白底盘，外层 16 道刻度装饰圈，中心一颗小红宝石，复古航海地图风格',
  },
  {
    slotKey: 'hud-seal',
    prompt:
      '一枚特工档案蜡封圆形印章，暗红蜡质质感配金色边圈，正中浮雕一颗五角星，边缘略带不规则蜡滴',
  },
  {
    slotKey: 'badge-hq',
    prompt:
      '一枚卡通盾形总部徽章，深蓝主体配金色边框，盾面中央一颗金星与两片月桂叶环绕，顶部金色绶带',
  },
  {
    slotKey: 'badge-hub',
    prompt:
      '一枚卡通六边形枢纽徽章，琥珀橙主体配深棕边框，正中是简化交叉箭头与齿轮组合图案',
  },
  {
    slotKey: 'badge-outpost',
    prompt:
      '一枚卡通圆形哨站徽章，森林绿主体配深绿边框，正中是一座简化瞭望塔与一颗小星星',
  },
];

const filter = process.argv.slice(2);
const todo = filter.length ? SLOTS.filter((s) => filter.includes(s.slotKey)) : SLOTS;
if (!todo.length) {
  console.error('no slot matched filter:', filter);
  process.exit(2);
}

async function genOne(slot) {
  const t0 = Date.now();
  try {
    const result = await generateImage({prompt: slot.prompt + COMMON});
    const ms = Date.now() - t0;
    if (!result.images.length) return {slotKey: slot.slotKey, ok: false, ms, error: 'no image'};
    const img = result.images[0];
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outPath = resolve(outDir, `${slot.slotKey}.${ext}`);
    writeFileSync(outPath, Buffer.from(img.base64Data, 'base64'));
    return {slotKey: slot.slotKey, ok: true, ms, outPath};
  } catch (e) {
    return {slotKey: slot.slotKey, ok: false, ms: Date.now() - t0, error: e.message ?? String(e)};
  }
}

async function runConcurrent(items, limit, worker) {
  const results = [];
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      console.log(`[${idx + 1}/${items.length}] start: ${items[idx].slotKey}`);
      const res = await worker(items[idx]);
      console.log(
        `[${idx + 1}/${items.length}] ${res.ok ? 'OK  ' : 'FAIL'} ${items[idx].slotKey} in ${res.ms}ms${res.error ? ' — ' + res.error : ''}`
      );
      results.push(res);
    }
  }
  await Promise.all(Array.from({length: Math.min(limit, items.length)}, () => next()));
  return results;
}

const t0 = Date.now();
const results = await runConcurrent(todo, 3, genOne);
console.log(`\n=== done in ${Date.now() - t0}ms ===`);
for (const r of results) {
  if (r.ok) console.log(`  OK   ${r.slotKey} → ${r.outPath}`);
  else console.log(`  FAIL ${r.slotKey}: ${r.error}`);
}
process.exit(results.every((r) => r.ok) ? 0 : 1);
