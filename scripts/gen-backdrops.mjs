#!/usr/bin/env node
/**
 * Batch-generate the 5 region backdrop images defined in
 * web/src/game/visualSlots.ts via the local vertex-mcp-server's vertex-client.
 *
 * Usage (from /Users/tiky/Projects/map-game):
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-backdrops.mjs                                # all 5
 *     node scripts/gen-backdrops.mjs map-backdrop-vanguard          # subset
 */
import {execSync} from 'child_process';
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {generateImage} from '../../vertex-mcp-server/src/vertex-client.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../web/public/generated');
if (!existsSync(outDir)) {
  mkdirSync(outDir, {recursive: true});
}

const DEFAULT_STYLE_SUFFIX =
  '；构图为 16:9 宽屏，俯视地图鸟瞰，中央留白供地图节点覆盖，色调降饱和便于作为深色 UI 衬底，画面边缘略微变暗，禁止出现任何文字、水印、UI 元素、人物特写。';

const TECH_STYLE_SUFFIX =
  '；构图为 16:9 宽屏，俯视地图鸟瞰，中央留白供地图节点覆盖，整体色调明亮鲜艳，深蓝紫底色配 cyan 与 magenta 霓虹高光，画面整体保持清晰高对比、避免压暗，禁止出现任何文字、水印、UI 元素、人物特写。';

const SLOTS = [
  {
    slotKey: 'map-backdrop-water',
    promptZh:
      '俯视战术地图风格，浅蓝海洋与米色沙洲，柔和等高线，无文字无 UI，儿童向特工题材插画，干净留白供叠加节点',
    aspect: '16:9',
  },
  {
    slotKey: 'map-backdrop-toy',
    promptZh:
      '糖果色积木港口与发条码头，柔光 3D 插画，地图沙盘感，无文字，低对比阴影，中心略空',
    aspect: '16:9',
  },
  {
    slotKey: 'map-backdrop-vanguard',
    promptZh:
      '未来科技群岛鸟瞰，深蓝紫海面叠加 cyan 数据光路网络，岛屿上分布着发光的圆形数据塔、全息网格线与 magenta 霓虹高光信号点，赛博朋克与扁平鸟瞰战略地图结合的科技风，画面明亮干净，中央留白可叠加 UI 节点',
    aspect: '16:9',
    styleSuffix: TECH_STYLE_SUFFIX,
  },
  {
    slotKey: 'map-backdrop-rainbow',
    promptZh:
      '彩虹色积雨云与闪电被卡通化，平面插画天气图，边缘柔和，无文字',
    aspect: '16:9',
  },
  {
    slotKey: 'map-backdrop-green',
    promptZh:
      '浅绿针叶林与土路鸟瞰，物流节点暗示（小仓库剪影），清新插画风，无文字',
    aspect: '16:9',
  },
];

const COMPRESS_LONG_EDGE = 1280;

function compressInPlace(pngPath) {
  try {
    execSync(`sips -Z ${COMPRESS_LONG_EDGE} "${pngPath}"`, {stdio: 'pipe'});
    return true;
  } catch (e) {
    console.error(`  sips compress failed for ${pngPath}: ${e.message}`);
    return false;
  }
}

const filterArgs = process.argv.slice(2);
const todo = filterArgs.length > 0 ? SLOTS.filter((s) => filterArgs.includes(s.slotKey)) : SLOTS;
if (todo.length === 0) {
  console.error('no slot matched filter:', filterArgs);
  console.error('available:', SLOTS.map((s) => s.slotKey).join(', '));
  process.exit(2);
}

async function genOne(slot) {
  const t0 = Date.now();
  try {
    const result = await generateImage({
      prompt: slot.promptZh + (slot.styleSuffix ?? DEFAULT_STYLE_SUFFIX),
    });
    const ms = Date.now() - t0;
    if (result.images.length === 0) {
      return {slotKey: slot.slotKey, ok: false, ms, error: 'no image returned'};
    }
    const img = result.images[0];
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outPath = resolve(outDir, `${slot.slotKey}.${ext}`);
    writeFileSync(outPath, Buffer.from(img.base64Data, 'base64'));
    const compressed = compressInPlace(outPath);
    return {slotKey: slot.slotKey, ok: true, ms, outPath, compressed};
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
      const tag = res.ok ? 'OK' : 'FAIL';
      console.log(`[${idx + 1}/${items.length}] ${tag} ${items[idx].slotKey} in ${res.ms}ms${res.error ? ' — ' + res.error : ''}${res.compressed === false ? ' (compress failed)' : ''}`);
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
for (const r of results) {
  if (!r.ok) console.log(`  FAIL ${r.slotKey}: ${r.error}`);
}
process.exit(okCount === todo.length ? 0 : 1);
