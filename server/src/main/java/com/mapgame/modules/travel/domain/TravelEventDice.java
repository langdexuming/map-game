package com.mapgame.modules.travel.domain;

import com.mapgame.modules.travel.vo.TripEventChoiceVO;
import com.mapgame.modules.travel.vo.TripEventEffectVO;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 路上事件 d100 掷骰
 * @author make java
 * @since 2026-06-11
 */
public final class TravelEventDice {

    private TravelEventDice() {
    }

    /**
     * 掷 d100
     * @return 1-100
     */
    public static int rollD100() {
        return ThreadLocalRandom.current().nextInt(1, 101);
    }

    /**
     * 按 d100 选取事件码
     * @param d100 掷骰结果
     * @return 事件码
     */
    public static String pickEventCode(int d100) {
        if (d100 <= 25) {
            return "NONE";
        }
        if (d100 <= 50) {
            return "CLUE_FOUND";
        }
        if (d100 <= 70) {
            return "TROUBLE";
        }
        if (d100 <= 85) {
            return "STORM";
        }
        if (d100 <= 95) {
            return "PIRATE";
        }
        return "HIDDEN";
    }

    /**
     * 构建事件展示与选项
     * @param eventCode 事件码
     * @return 事件定义
     */
    public static TripEventDefinition definitionOf(String eventCode) {
        return switch (eventCode) {
            case "CLUE_FOUND" -> new TripEventDefinition(
                    "CLUE_FOUND", "偶遇线索", "获得线索 +1 · 解锁支线", true,
                    List.of(choice("take", "收下！", null, effect(0, 1, 0, 0, 0))));
            case "TROUBLE" -> new TripEventDefinition(
                    "TROUBLE", "小麻烦", "补给磕碰，损失 10 金币。", true,
                    List.of(
                            choice("pay", "支付修理费 -¥10", null, effect(-10, 0, 0, 0, 0)),
                            choice("ignore", "凑合继续", null, effect(0, 0, 0, 0, 1))));
            case "STORM" -> new TripEventDefinition(
                    "STORM", "风暴来袭", "航线关闭 · 延误 +1 回合", true,
                    List.of(
                            choice("wait", "等待放晴", null, effect(0, 0, 0, 0, 1)),
                            choice("sea", "改走海路", 50, effect(-50, 0, 0, 0, 0))));
            case "PIRATE" -> new TripEventDefinition(
                    "PIRATE", "海盗拦截", "护卫战斗 · 胜利 +30 金币", true,
                    List.of(
                            choice("fight", "迎战", null, effect(30, 0, 0, 0, 0)),
                            choice("detour", "绕路 -¥50", 50, effect(-50, 0, 0, 0, 0))));
            case "HIDDEN" -> new TripEventDefinition(
                    "HIDDEN", "隐藏支线", "发现一条隐藏支线，解锁额外奖励。", true,
                    List.of(choice("take", "收下！", null, effect(0, 2, 1, 0, 0))));
            default -> new TripEventDefinition(
                    "NONE", "一切顺利", "本回合平稳推进，没有任何意外。", false, List.of());
        };
    }

    private static TripEventChoiceVO choice(String key, String label, Integer requireCoin, TripEventEffectVO effect) {
        TripEventChoiceVO vo = new TripEventChoiceVO();
        vo.setKey(key);
        vo.setLabel(label);
        vo.setRequireCoin(requireCoin);
        vo.setEffect(effect);
        return vo;
    }

    private static TripEventEffectVO effect(int coin, int clue, int star, int fuel, int delay) {
        TripEventEffectVO vo = new TripEventEffectVO();
        vo.setCoin(coin);
        vo.setClue(clue);
        vo.setStar(star);
        vo.setFuel(fuel);
        vo.setDelay(delay);
        return vo;
    }

    /**
     * 事件定义
     */
    public record TripEventDefinition(
            String code,
            String title,
            String body,
            boolean interactive,
            List<TripEventChoiceVO> choices) {
    }
}
