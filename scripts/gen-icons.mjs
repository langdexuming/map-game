#!/usr/bin/env node
/**
 * Batch-generate ALL icon/sprite assets for the game UI via vertex-mcp-server.
 *
 * Usage (from /Users/tiky/Projects/map-game):
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-icons.mjs            # all
 *   node scripts/gen-icons.mjs coin star    # subset by slotKey
 */
import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {generateImage} from '../../vertex-mcp-server/src/vertex-client.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../web/public/generated');
if (!existsSync(outDir)) {
  mkdirSync(outDir, {recursive: true});
}

const COMMON_ICON_SUFFIX =
  '。要求：正方形 1:1 构图，单一物体居中，纯白或纯透明背景（如不支持透明则用#0d1117 深灰背景便于扣图），无文字无水印无 UI 元素，扁平 3D 渲染风格统一干净，柔光，可作为 64px 图标使用，主体填充约画面 70%。';

const SLOTS = [
  // ── resource icons (HUD chips) ─────────────────────────────────────────
  {
    slotKey: 'icon-coin',
    prompt: '一枚发光的金色游戏金币，正面有简化星形浮雕，金属质感柔和',
  },
  {
    slotKey: 'icon-clue',
    prompt: '一只复古黄铜放大镜俯视角度，镜片透蓝，象征"线索"，柔光发亮',
  },
  {
    slotKey: 'icon-star',
    prompt: '一枚五角星徽章，渐变紫罗兰到亮粉，外圈淡光晕，代表"星星积分"',
  },
  {
    slotKey: 'icon-fuel',
    prompt: '一个圆滚的卡通油桶，绿色机身配亮橘高光，顶部一滴油珠悬浮',
  },

  // ── command / HQ ────────────────────────────────────────────────────────
  {
    slotKey: 'icon-hq',
    prompt: '一座小型卡通指挥基地塔楼，雷达天线在顶部，金属灰外墙带橘色信号灯',
  },

  // ── city pins (map markers) ────────────────────────────────────────────
  {
    slotKey: 'pin-unlocked',
    prompt:
      '一枚特工地图徽章，倒立水滴形地图大头钉，琥珀金底色配深棕轮廓，正面有简化指南针纹饰，圆滑边缘',
  },
  {
    slotKey: 'pin-locked',
    prompt:
      '一枚被铜锁封住的灰色地图大头钉，倒立水滴形，金属灰主色配冷蓝阴影，正面挂一个小挂锁',
  },

  // ── vehicles (planner / trip tokens) ───────────────────────────────────
  {
    slotKey: 'veh-car',
    prompt: '一辆小巧的卡通圆角越野车俯侧视角，红色车身白色车顶，圆胖比例',
  },
  {
    slotKey: 'veh-train',
    prompt: '一节卡通柴油机车头侧视，黄色车身黑色顶棚，圆滚短小如玩具',
  },
  {
    slotKey: 'veh-plane',
    prompt: '一架卡通螺旋桨小飞机俯侧视，蓝白配色，机翼短粗',
  },
  {
    slotKey: 'veh-ship',
    prompt: '一艘卡通蒸汽船侧视，深蓝船身红色烟囱白色驾驶舱，可爱比例',
  },

  // ── event / alert ──────────────────────────────────────────────────────
  {
    slotKey: 'icon-alert',
    prompt: '一个鲜橘色三角形警示牌带圆角阴影，中央是惊叹号，柔和金属质感',
  },
];

const filterArgs = process.argv.slice(2);
const todo = filterArgs.length > 0 ? SLOTS.filter((s) => filterArgs.includes(s.slotKey)) : SLOTS;
if (todo.length === 0) {
  console.error('no slot matched filter:', filterArgs);
  process.exit(2);
}

async function genOne(slot) {
  const t0 = Date.now();
  try {
    const result = await generateImage({prompt: slot.prompt + COMMON_ICON_SUFFIX});
    const ms = Date.now() - t0;
    if (result.images.length === 0) {
      return {slotKey: slot.slotKey, ok: false, ms, error: 'no image returned'};
    }
    const img = result.images[0];
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outPath = resolve(outDir, `${slot.slotKey}.${ext}`);
    writeFileSync(outPath, Buffer.from(img.base64Data, 'base64'));
    return {slotKey: slot.slotKey, ok: true, ms, outPath};
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
      console.log(`[${idx + 1}/${items.length}] ${tag} ${items[idx].slotKey} in ${res.ms}ms${res.error ? ' — ' + res.error : ''}`);
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
