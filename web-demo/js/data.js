/**
 * Mock 数据 (与 server/db/migration/V1__init_world.sql + V4__init_travel.sql 一致)
 * 后续接真实后端时改为从 /api/world/1/regions 拉取即可
 * @author make java
 * @since 2026-05-01
 */

export const VEHICLE = {
    PLANE: 1, SHIP: 2, TRAIN: 3, TRUCK: 4, FOOT: 5,
};

export const VEHICLE_NAME = { 1: 'PLANE', 2: 'SHIP', 3: 'TRAIN', 4: 'TRUCK', 5: 'FOOT' };
export const VEHICLE_ICON = { 1: '✈', 2: '⛴', 3: '🚆', 4: '🚚', 5: '🥾' };
export const VEHICLE_COLOR = { 1: '#f59e0b', 2: '#3b82f6', 3: '#92400e', 4: '#6b7280', 5: '#10b981' };
export const VEHICLE_DASH = { 1: [8, 4], 2: [], 3: [2, 4], 4: [], 5: [6, 6] };

export const CITIES = [
    { id: 1, regionName: 'Water Land',       name: 'Little Aegis HQ',  level: 1, lng: -10, lat: 30,  unlocked: true },
    { id: 2, regionName: 'Toy Isles',        name: 'Nova Base',         level: 1, lng: 60,  lat: 35,  unlocked: true },
    { id: 3, regionName: 'Vanguard Isles',   name: 'Apex HQ',           level: 1, lng: -45, lat: -15, unlocked: true },
    { id: 4, regionName: 'Vanguard Isles',   name: 'Synergy City',      level: 2, lng: -30, lat: -25, unlocked: true },
    { id: 5, regionName: 'Rainbow Land',     name: 'Nave Outpost',      level: 3, lng: 85,  lat: -10, unlocked: true },
    { id: 6, regionName: 'Greenforest Land', name: 'Greenforest Hub',   level: 1, lng: 25,  lat: 5,   unlocked: true },
];

const R = (from, to, vt, dist, price, turn) => ({ fromCity: from, toCity: to, vehicleType: vt, distance: dist, basePrice: price, baseTurn: turn });

export const ROUTES = [
    R(1, 2, 1, 7000, 320, 2), R(2, 1, 1, 7000, 320, 2),
    R(1, 3, 1, 5500, 280, 2), R(3, 1, 1, 5500, 280, 2),
    R(1, 6, 1, 4000, 220, 2), R(6, 1, 1, 4000, 220, 2),
    R(2, 6, 1, 4500, 240, 2), R(6, 2, 1, 4500, 240, 2),
    R(3, 6, 1, 5000, 260, 2), R(6, 3, 1, 5000, 260, 2),

    R(1, 3, 2, 5500, 130, 4), R(3, 1, 2, 5500, 130, 4),
    R(2, 6, 2, 4500, 110, 3), R(6, 2, 2, 4500, 110, 3),
    R(3, 4, 2, 800,  60,  1), R(4, 3, 2, 800,  60,  1),

    R(3, 4, 3, 700, 80, 1),   R(4, 3, 3, 700, 80, 1),
    R(1, 6, 3, 3500, 180, 3), R(6, 1, 3, 3500, 180, 3),

    R(6, 5, 4, 1500, 90, 2),  R(5, 6, 4, 1500, 90, 2),

    R(4, 5, 5, 2000, 0, 5),   R(5, 4, 5, 2000, 0, 5),
];

export const cityById = (id) => CITIES.find(c => c.id === id);

export const TRIP_EVENTS = [
    { weight: 25, code: 'NONE',       title: '一切顺利',     body: '本回合平稳推进, 没有任何意外。' },
    { weight: 25, code: 'CLUE_FOUND', title: '偶遇线索',     body: '路上发现一条新线索!', effect: { clue: 1 } },
    { weight: 20, code: 'TROUBLE',    title: '小麻烦',       body: '碰到点小麻烦, 损失 10 金币。', effect: { coin: -10 } },
    { weight: 15, code: 'WEATHER',    title: '天气延迟',     body: '遭遇恶劣天气, 行程延迟 1 回合。', effect: { delay: 1 } },
    {
        weight: 10, code: 'BANDIT',   title: '⚔ 强盗袭击',   body: '前方有强盗! 你的选择?', interactive: true,
        choices: [
            { key: 'fight', label: '正面战斗', effect: { coin: 50,  label: '战斗胜利, +50 金币' } },
            { key: 'flee',  label: '撤退绕路', effect: { delay: 1,  label: '安全撤退, +1 回合' } },
            { key: 'bribe', label: '贿赂 100 金币', requireCoin: 100, effect: { coin: -100, label: '贿赂成功, 平安通过' } },
        ],
    },
    { weight: 5,  code: 'HIDDEN',     title: '★ 隐藏支线!',  body: '发现一条隐藏支线, 解锁新任务!', effect: { star: 1, clue: 2 } },
];
