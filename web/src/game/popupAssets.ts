/**
 * 弹窗装饰图片资产路径表。
 *
 * 所有图通过 [scripts/gen-popup-assets.mjs](../../../scripts/gen-popup-assets.mjs) 由 vertex
 * 生成，落在 [web/public/generated/](../../public/generated/)，已用 sips -Z 缩到 256/512px。
 * 通过 `<img src=...>` 直接由浏览器加载，前端代码不需要 import 二进制。
 */
import type {VehicleType} from './mockData';

const BASE = '/generated';

export const POPUP_ASSET = {
  // 事件模态
  eventEmblem: `${BASE}/event-emblem.png`,
  iconAlert: `${BASE}/icon-alert.png`,

  // 胜负结算
  victoryLaurel: `${BASE}/victory-laurel.png`,
  defeatSeal: `${BASE}/defeat-seal.png`,

  // 城市浮窗
  flagStart: `${BASE}/flag-start.png`,
  flagEnd: `${BASE}/flag-end.png`,
  pinUnlocked: `${BASE}/pin-unlocked.png`,
  pinLocked: `${BASE}/pin-locked.png`,

  // 行程规划
  ticketFrame: `${BASE}/ticket-frame.png`,

  // 资源 chip 图标
  iconCoin: `${BASE}/icon-coin.png`,
  iconClue: `${BASE}/icon-clue.png`,
  iconStar: `${BASE}/icon-star.png`,
  iconFuel: `${BASE}/icon-fuel.png`,
  iconHq: `${BASE}/icon-hq.png`,

  // 弹窗标题丝带（PNG 无文字，HTML 叠 i18n 标题）
  ribbonEvent: `${BASE}/ribbon-event.png`,
  ribbonVictory: `${BASE}/ribbon-victory.png`,
  ribbonDefeat: `${BASE}/ribbon-defeat.png`,
  ribbonCity: `${BASE}/ribbon-city.png`,
  ribbonPlanner: `${BASE}/ribbon-planner.png`,
} as const;

export const VEHICLE_PNG: Partial<Record<VehicleType, string>> = {
  PLANE: `${BASE}/veh-plane.png`,
  SHIP: `${BASE}/veh-ship.png`,
  TRAIN: `${BASE}/veh-train.png`,
  TRUCK: `${BASE}/veh-car.png`,
};
