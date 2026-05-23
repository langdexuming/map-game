#!/usr/bin/env node
/**
 * Smoke test: directly call vertex-client.js generateImage with a tiny prompt,
 * write result to /tmp/vertex-smoke.png. Confirms proxy + API key end-to-end.
 *
 * Run from /Users/tiky/Projects/map-game with:
 *   node scripts/gen-icons-smoke.mjs
 */
import {writeFileSync} from 'fs';
import {generateImage} from '../../vertex-mcp-server/src/vertex-client.js';

process.env.GOOGLE_GENAI_USE_VERTEXAI = 'True';
process.env.HTTP_PROXY = process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
process.env.HTTPS_PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:7897';
process.env.NODE_USE_ENV_PROXY = '1';

const t0 = Date.now();
const result = await generateImage({
  prompt: 'a simple round gold coin, flat icon style, transparent background, no text',
});
const ms = Date.now() - t0;
console.log(`generated in ${ms}ms, model=${result.model}, images=${result.images.length}, text=${result.text ? result.text.slice(0, 80) : 'null'}`);
if (result.images.length > 0) {
  const img = result.images[0];
  const buf = Buffer.from(img.base64Data, 'base64');
  writeFileSync('/tmp/vertex-smoke.png', buf);
  console.log(`wrote /tmp/vertex-smoke.png (${buf.length} bytes, mime=${img.mimeType})`);
} else {
  console.log('no image returned');
}
