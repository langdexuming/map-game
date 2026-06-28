/**
 * public/ 目录静态资源 URL，兼容 Vite dev、Web 部署与 Electron file://
 * @author make java
 * @since 2026-06-28
 */
export function publicAsset(path: string): string {
  const normalized = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL;
  if (base.endsWith('/')) {
    return `${base}${normalized}`;
  }
  return `${base}/${normalized}`;
}
