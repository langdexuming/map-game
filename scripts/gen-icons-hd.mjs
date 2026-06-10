#!/usr/bin/env node
/**
 * High-definition regeneration of the 7 popup icons users found "not精致":
 *   pin-unlocked, pin-locked, veh-car, veh-train, veh-plane, veh-ship, icon-alert
 *
 * Differences from gen-popup-assets.mjs:
 *  - Prompts upgraded with 2.5D iso / PBR / soft light / commercial game-UI descriptors
 *  - sips -Z 512 instead of 256 to preserve detail
 *  - Overwrites the same slot filenames so component imports unchanged
 *
 * Usage (from /Users/tiky/Projects/map-game):
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-icons-hd.mjs            # all 7
 *     node scripts/gen-icons-hd.mjs veh-car    # subset by slotKey
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

const HD_SUFFIX =
  '。要求：正方形 1:1 构图，单一物体居中，纯透明背景（如不支持透明则用 #0d1117 深灰背景便于扣图），无文字无水印无 UI 元素。专业游戏 UI 商品图标级精致度：立体光影、柔光高光、环境光遮蔽阴影、细腻笔触与材质表现，PBR 金属或漆面质感，2.5D 等距视角，主体填充画面约 65%。要求画面整体明亮、避免大片暗区，色彩饱和不灰。';

const SLOTS = [
  {
    slotKey: 'pin-unlocked',
    prompt:
      '一枚精致 3D 卡通地图徽章大头钉，倒立水滴形，2.5D 等距视角，琥珀金主体配深棕轮廓与底座，正面浮雕一个简化指南针玫瑰花纹，金属光泽与 PBR 高反射高光，柔光从左上 45 度打来',
  },
  {
    slotKey: 'pin-locked',
    prompt:
      '一枚精致 3D 卡通深灰色地图大头钉被铜锁封住，倒立水滴形，2.5D 等距视角，金属灰主色配冷蓝阴影，正面挂一个小铜挂锁有钥匙孔细节，链条小段，PBR 金属磨砂质感',
  },
  {
    slotKey: 'veh-car',
    prompt:
      '一辆精致 3D 卡通圆角越野车，2.5D 等距视角，鲜红色金属漆车身配镀铬白车顶与黑色车窗，黑色橡胶轮胎与轮毂细节，前大灯与车标细节，圆胖可爱比例，柔和环境光与高光反射 PBR 漆面质感',
  },
  {
    slotKey: 'veh-train',
    prompt:
      '一节精致 3D 卡通柴油机车头，2.5D 等距视角侧视，鲜黄色车身配黑色车顶与深绿装饰条，金属铆钉与大圆灯前端，黑色车轮，圆滚短小如玩具，PBR 金属与漆面质感，柔光从左上 45 度',
  },
  {
    slotKey: 'veh-plane',
    prompt:
      '一架精致 3D 卡通螺旋桨小飞机，2.5D 等距视角，亮蓝白配色金属机身，螺旋桨头与短粗机翼，舷窗细节与机尾装饰，圆胖可爱比例，PBR 金属反光高光，环境光遮蔽阴影',
  },
  {
    slotKey: 'veh-ship',
    prompt:
      '一艘精致 3D 卡通蒸汽船，2.5D 等距视角，深海军蓝船身配鲜红烟囱与奶白色驾驶舱，金属铆钉与舷窗细节，船头小锚装饰，可爱比例，PBR 漆面与金属质感',
  },
  {
    slotKey: 'icon-alert',
    prompt:
      '一枚精致 3D 卡通鲜橘色三角形警示牌，2.5D 等距视角，圆角边缘，中央粗黑边白色惊叹号大号居中，金属底座小阴影，柔和金属漆质感，高光与环境光遮蔽',
  },
];

const COMPRESS_LONG_EDGE = 512;

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
    const result = await generateImage({prompt: slot.prompt + HD_SUFFIX});
    if (result.images.length === 0) {
      return {slotKey: slot.slotKey, ok: false, ms: Date.now() - t0, error: 'no image returned'};
    }
    const img = result.images[0];
    const ext = img.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const outPath = resolve(outDir, `${slot.slotKey}.${ext}`);
    writeFileSync(outPath, Buffer.from(img.base64Data, 'base64'));
    const compressed = compressInPlace(outPath);
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
