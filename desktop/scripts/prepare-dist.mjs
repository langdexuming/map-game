/**
 * 将 web/dist 复制到 desktop/dist（Electron 静态资源）
 */
import { cpSync, existsSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = join(root, 'web', 'dist');
const dest = join(root, 'desktop', 'dist');

if (!existsSync(src)) {
  console.error('缺少 web/dist，请先执行 npm run build:web -- --base ./');
  process.exit(1);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}

cpSync(src, dest, { recursive: true });
console.log('已复制 web/dist → desktop/dist');
