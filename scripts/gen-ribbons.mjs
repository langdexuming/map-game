#!/usr/bin/env node
/**
 * Batch-generate the 5 popup header ribbon PNGs via vertex-mcp-server.
 * Ribbons are blank-center banners (NO text printed) so HTML can overlay
 * the i18n title on top of them. Each is post-compressed in-place with
 * `sips -Z 512` for a smaller payload.
 *
 * Usage (from /Users/tiky/Projects/map-game):
 *   NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7897 \
 *     HTTP_PROXY=http://127.0.0.1:7897 GOOGLE_GENAI_USE_VERTEXAI=True \
 *     node scripts/gen-ribbons.mjs            # all 5
 *     node scripts/gen-ribbons.mjs ribbon-event  # subset
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

const RIBBON_SUFFIX =
  '。要求：横向宽窄比约 4:1 的丝带横幅装饰，两端有对称的螺旋卷边或燕尾飘带，中央有干净的浅色书写区域可叠加标题文字，全龄卡通风格 — 粗黑描边、扁平鲜艳填充、轻微高光。绝对不要在图上印任何文字、字母、数字、汉字、符号或水印（书写区域必须完全空白）。背景纯透明（如不支持则纯白 #ffffff 便于扣图）。主体填充画面约 90%。';

const SLOTS = [
  {
    slotKey: 'ribbon-event',
    prompt: '一条琥珀金色丝绸丝带横幅，金属质感反光，两端螺旋飘带卷曲，中央为米色浅金书写区域',
  },
  {
    slotKey: 'ribbon-victory',
    prompt: '一条翠绿色丝绸丝带横幅，配金色镶边，两端燕尾飘带散发星光点缀，中央为奶白色书写区域，象征胜利',
  },
  {
    slotKey: 'ribbon-defeat',
    prompt: '一条暗红色丝绸丝带横幅，配铁灰色镶边和略微撕裂的飘带边缘，中央为深米色书写区域，象征任务失败',
  },
  {
    slotKey: 'ribbon-city',
    prompt: '一条咖啡棕色皮革质感丝带横幅，两端是卷曲的羊皮纸飘带，中央为米黄色书写区域，复古档案风',
  },
  {
    slotKey: 'ribbon-planner',
    prompt: '一条海军深蓝色丝绸丝带横幅，配古铜金镶边，两端燕尾飘带带罗盘玫瑰小星，中央为浅蓝色书写区域，象征调度',
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
    const result = await generateImage({prompt: slot.prompt + RIBBON_SUFFIX});
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
