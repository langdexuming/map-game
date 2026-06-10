#!/usr/bin/env node
/**
 * 生成 UI 增强装饰素材 — 罗盘玫瑰、HUD 羊皮纸长条、机密印章。
 * 用法（从 /Users/tiky/Projects/map-game 跑）：
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-ui-flair.mjs           # 全跑
 *   node scripts/gen-ui-flair.mjs compass-rose # 单跑
 */
import {execSync} from 'child_process';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {generateImage} from '../../vertex-mcp-server/src/vertex-client.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../web/public/generated');
if (!existsSync(outDir)) mkdirSync(outDir, {recursive: true});

const DECOR_SUFFIX =
  '。要求：正方形 1:1 构图，主体居中，纯白 #ffffff 背景（便于扣图），无文字无水印，全龄卡通风格 — 粗黑描边、扁平鲜艳填充、可爱比例，主体填充画面约 80%，柔和光影。';

const SLOTS = [
  {
    slotKey: 'compass-rose',
    size: 256,
    suffix: DECOR_SUFFIX,
    prompt:
      '一枚特工地图罗盘玫瑰，四向尖角星形指针，琥珀金主色配深棕轮廓与象牙白底盘，外层 16 道刻度装饰圈，中心一颗小红宝石，复古航海地图风格',
  },
  {
    slotKey: 'hud-seal',
    size: 256,
    suffix: DECOR_SUFFIX,
    prompt:
      '一枚特工档案蜡封圆形印章，暗红蜡质质感配金色边圈，正中浮雕一颗五角星，边缘略带不规则蜡滴，像情报机密封口',
  },
  {
    slotKey: 'badge-hq',
    size: 256,
    suffix: DECOR_SUFFIX,
    prompt:
      '一枚卡通盾形总部徽章，蓝色主体加金色边框，盾面中央有一颗闪亮金星与两片月桂叶环绕，顶部一条简短金色绶带，象征指挥总部',
  },
  {
    slotKey: 'badge-hub',
    size: 256,
    suffix: DECOR_SUFFIX,
    prompt:
      '一枚卡通六边形枢纽徽章，琥珀橙色主体加深棕边框，徽章中央是一个简化的交叉箭头/齿轮组合图案，象征交通枢纽',
  },
  {
    slotKey: 'badge-outpost',
    size: 256,
    suffix: DECOR_SUFFIX,
    prompt:
      '一枚卡通圆形哨站徽章，森林绿主体加深绿边框，徽章中央是一座简化瞭望塔与一颗小星星，象征前哨观察点',
  },
];

const argFilter = process.argv.slice(2);
const todo = argFilter.length > 0 ? SLOTS.filter((s) => argFilter.includes(s.slotKey)) : SLOTS;
if (todo.length === 0) {
  console.error('No matching slots. Available:', SLOTS.map((s) => s.slotKey).join(', '));
  process.exit(1);
}

function compressInPlace(pngPath, maxPx) {
  try {
    execSync(`sips -Z ${maxPx} "${pngPath}" --out "${pngPath}"`, {stdio: 'pipe'});
    return true;
  } catch (e) {
    console.error(`  sips compress failed for ${pngPath}: ${e.message}`);
    return false;
  }
}

async function genOne(slot) {
  const t0 = Date.now();
  try {
    const result = await generateImage({prompt: slot.prompt + slot.suffix});
    if (result.images.length === 0) {
      return {slotKey: slot.slotKey, ok: false, ms: Date.now() - t0, error: 'no image returned'};
    }
    const img = result.images[0];
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outPath = resolve(outDir, `${slot.slotKey}.${ext}`);
    writeFileSync(outPath, Buffer.from(img.base64Data, 'base64'));
    const compressed = compressInPlace(outPath, slot.size);
    return {slotKey: slot.slotKey, ok: true, ms: Date.now() - t0, outPath, compressed};
  } catch (e) {
    return {slotKey: slot.slotKey, ok: false, ms: Date.now() - t0, error: e.message ?? String(e)};
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      console.log(`[${idx + 1}/${items.length}] start: ${items[idx].slotKey}`);
      const res = await worker(items[idx]);
      const tag = res.ok ? 'OK  ' : 'FAIL';
      console.log(
        `[${idx + 1}/${items.length}] ${tag} ${items[idx].slotKey} in ${res.ms}ms${res.error ? ' — ' + res.error : ''}${
          res.compressed === false ? ' (compress failed)' : ''
        }`,
      );
      results.push(res);
    }
  }
  await Promise.all(Array.from({length: Math.min(limit, items.length)}, () => next()));
  return results;
}

const t0 = Date.now();
const results = await runWithConcurrency(todo, 3, genOne);
const ms = Date.now() - t0;
const okCount = results.filter((r) => r.ok).length;
console.log(`\n=== done in ${ms}ms — ${okCount}/${todo.length} succeeded ===`);
for (const r of results) if (!r.ok) console.log(`  FAIL ${r.slotKey}: ${r.error}`);
process.exit(okCount === todo.length ? 0 : 1);
