#!/usr/bin/env node
/**
 * Batch-generate the popup decoration assets via vertex-mcp-server.
 * Generated PNGs are immediately downscaled in-place with `sips -Z` for
 * a 10–15x size reduction (1024px source → 256/512px target).
 *
 * Usage (from /Users/tiky/Projects/map-game):
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-popup-assets.mjs           # all 13
 *   node scripts/gen-popup-assets.mjs flag-start  # subset by slotKey
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

const ICON_SUFFIX =
  '。要求：正方形 1:1 构图，单一物体居中，纯白或纯透明背景（如不支持透明则用 #0d1117 深灰背景便于扣图），无文字无水印无 UI 元素，全龄卡通风格 — 粗黑描边、扁平彩色填充、轻微高光，可作为 64-128px 图标使用，主体填充约画面 70%。';

const DECOR_SUFFIX =
  '。要求：正方形 1:1 构图，主体居中，纯透明背景（如不支持透明则用纯白 #ffffff 背景便于扣图），无文字无水印，全龄卡通风格 — 粗黑描边、扁平鲜艳填充、可爱比例，主体填充画面约 80%，柔和光影。';

const SLOTS = [
  // ── 补齐：上一轮 gen-icons.mjs 未跑完的 7 张 ─────────────────────
  {
    slotKey: 'pin-unlocked',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一枚特工地图徽章，倒立水滴形地图大头钉，琥珀金底色配深棕轮廓，正面有简化指南针纹饰，圆滑边缘',
  },
  {
    slotKey: 'pin-locked',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一枚被铜锁封住的灰色地图大头钉，倒立水滴形，金属灰主色配冷蓝阴影，正面挂一个小挂锁',
  },
  {
    slotKey: 'veh-car',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一辆小巧的卡通圆角越野车俯侧视角，红色车身白色车顶，圆胖比例',
  },
  {
    slotKey: 'veh-train',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一节卡通柴油机车头侧视，黄色车身黑色顶棚，圆滚短小如玩具',
  },
  {
    slotKey: 'veh-plane',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一架卡通螺旋桨小飞机俯侧视，蓝白配色，机翼短粗',
  },
  {
    slotKey: 'veh-ship',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一艘卡通蒸汽船侧视，深蓝船身红色烟囱白色驾驶舱，可爱比例',
  },
  {
    slotKey: 'icon-alert',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一个鲜橘色三角形警示牌带圆角阴影，中央是惊叹号，柔和金属质感',
  },

  // ── 新增：本轮弹窗装饰 6 张 ───────────────────────────────────────
  {
    slotKey: 'event-emblem',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一枚卡通密令信封带蜡印封口，琥珀金信封配深红色印章，印章上有简化星徽，邮戳风的圆角装饰',
  },
  {
    slotKey: 'victory-laurel',
    size: 512,
    suffix: DECOR_SUFFIX,
    prompt: '一个椭圆形卡通金色桂叶花环，中心镂空透明，左右对称的橄榄叶+小星星点缀，金属高光，象征胜利',
  },
  {
    slotKey: 'defeat-seal',
    size: 512,
    suffix: DECOR_SUFFIX,
    prompt: '一枚破碎成两半的卡通红色蜡封印章，裂纹明显，深红主色配金色边线，象征任务失败',
  },
  {
    slotKey: 'flag-start',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一面卡通绿色三角小旗在木杆上，迎风飘起的形态，旗面上有圆形发车标记，象征出发起点',
  },
  {
    slotKey: 'flag-end',
    size: 256,
    suffix: ICON_SUFFIX,
    prompt: '一面卡通红白格子方旗在木杆上飘起，象征终点/赛车终点线，旗杆顶有小星',
  },
  {
    slotKey: 'ticket-frame',
    size: 512,
    suffix: DECOR_SUFFIX,
    prompt: '一个卡通老式纸质车票边框，长方形，两侧有半圆撕边孔洞如邮票齿孔，中央完全透明留白，米黄底色配深棕描边，四角有装饰小星',
  },
];

const filterArgs = process.argv.slice(2);
const todo = filterArgs.length > 0 ? SLOTS.filter((s) => filterArgs.includes(s.slotKey)) : SLOTS;
if (todo.length === 0) {
  console.error('no slot matched filter:', filterArgs);
  console.error('available:', SLOTS.map((s) => s.slotKey).join(', '));
  process.exit(2);
}

function compressInPlace(pngPath, targetSize) {
  try {
    execSync(`sips -Z ${targetSize} "${pngPath}"`, {stdio: 'pipe'});
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
