/**
 * 精细化美术资源槽位：与 Vertex AI / Imagen（通过 Cursor Vertex MCP）一一对应。
 * 生成后将文件放入 web/public/generated/ 下同名路径即可被界面引用。
 *
 * MCP 调用建议（在 Cursor 中启用 Vertex 相关 MCP 后）：
 * 1. 选中下方 slotKey，按槽位单独生成，避免一张图塞多主题。
 * 2. 使用 promptZh + negativePrompt；宽高比与 aspectRatioHint 对齐。
 * 3. 导出 PNG 或 WebP，文件名与 publicPath 一致。
 *
 * @author make java
 * @since 2026-05-12
 */
import {publicAsset} from '../lib/publicAsset';
export interface VertexImageSlot {
  /** 稳定键，供代码与脚本引用 */
  slotKey: string;
  /** 相对 public 的 URL */
  publicPath: string;
  /** 在游戏中的用途说明 */
  usage: string;
  /** 交给 Vertex / Imagen 的中文主提示词（可再叠加风格词） */
  promptZh: string;
  /** 推荐宽高比，例如 16:9 */
  aspectRatioHint: string;
  negativePrompt: string;
}

export const VERTEX_IMAGE_SLOTS: VertexImageSlot[] = [
  {
    slotKey: 'map-backdrop-water',
    publicPath: '/generated/map-backdrop-water.png',
    usage: 'Water Land 区域旅行图衬底',
    promptZh:
      '俯视战术地图风格，浅蓝海洋与米色沙洲，柔和等高线，无文字无 UI，儿童向特工题材插画，干净留白供叠加节点',
    aspectRatioHint: '16:9',
    negativePrompt: 'text, watermark, logo, ui, photorealistic gore, lowres',
  },
  {
    slotKey: 'map-backdrop-toy',
    publicPath: '/generated/map-backdrop-toy.png',
    usage: 'Toy Isles 区域旅行图衬底',
    promptZh:
      '糖果色积木港口与发条码头，柔光 3D 插画，地图沙盘感，无文字，低对比阴影，中心略空',
    aspectRatioHint: '16:9',
    negativePrompt: 'text, watermark, characters facing camera, horror',
  },
  {
    slotKey: 'map-backdrop-vanguard',
    publicPath: '/generated/map-backdrop-vanguard.png',
    usage: 'Vanguard Isles 工业枢纽衬底',
    promptZh:
      '锈橙与钢灰的重工业群岛鸟瞰，简化烟囱与吊臂剪影，战略地图质感，无文字',
    aspectRatioHint: '16:9',
    negativePrompt: 'text, smoke text, realistic fire, people closeup',
  },
  {
    slotKey: 'map-backdrop-rainbow',
    publicPath: '/generated/map-backdrop-rainbow.png',
    usage: 'Rainbow Land 气象前线衬底',
    promptZh:
      '彩虹色积雨云与闪电被卡通化，平面插画天气图，边缘柔和，无文字',
    aspectRatioHint: '16:9',
    negativePrompt: 'text, scary storm, realistic disaster',
  },
  {
    slotKey: 'map-backdrop-green',
    publicPath: '/generated/map-backdrop-green.png',
    usage: 'Greenforest Land 补给走廊衬底',
    promptZh:
      '浅绿针叶林与土路鸟瞰，物流节点暗示（小仓库剪影），清新插画风，无文字',
    aspectRatioHint: '16:9',
    negativePrompt: 'text, animals large, jungle horror',
  },
  {
    slotKey: 'city-marker-atlas',
    publicPath: '/generated/city-marker-atlas.webp',
    usage: '城市节点图块精灵（四态拼在一张内由前端裁切时可扩展；当前仅占位）',
    promptZh:
      '四枚圆形地图图钉图标，特工徽章风格，白底 PNG 感，无文字，统一描边',
    aspectRatioHint: '1:1',
    negativePrompt: 'text, watermark, realistic photo',
  },
];

const SLOT_BY_THEME: Record<string, string> = {
  'Ocean Routes': 'map-backdrop-water',
  'Clockwork Ports': 'map-backdrop-toy',
  'Heavy Industry': 'map-backdrop-vanguard',
  'Weather Front': 'map-backdrop-rainbow',
  'Supply Corridor': 'map-backdrop-green',
  '海上航线': 'map-backdrop-water',
  '发条港口': 'map-backdrop-toy',
  '重工业带': 'map-backdrop-vanguard',
  '气象前线': 'map-backdrop-rainbow',
  '补给走廊': 'map-backdrop-green',
  // 后端 V1__init_world.sql 里 region.theme 用色码
  'BLUE': 'map-backdrop-water',
  'PASTEL': 'map-backdrop-toy',
  'GOLD': 'map-backdrop-vanguard',
  'RAINBOW': 'map-backdrop-rainbow',
  'GREEN': 'map-backdrop-green',
};

export function backdropUrlForRegionTheme(theme: string | undefined): string | null {
  if (!theme) {
    return null;
  }
  const key = SLOT_BY_THEME[theme];
  if (!key) {
    return null;
  }
  const slot = VERTEX_IMAGE_SLOTS.find((item) => item.slotKey === key);
  return slot ? publicAsset(slot.publicPath) : null;
}
