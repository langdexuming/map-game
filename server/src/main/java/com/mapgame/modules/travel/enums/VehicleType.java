package com.mapgame.modules.travel.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 载具类型
 * @author make java
 * @since 2026-06-11
 */
@Getter
@AllArgsConstructor
public enum VehicleType {

    PLANE(1, "PLANE", 0.2, 15),
    SHIP(2, "SHIP", 0.3, 8),
    TRAIN(3, "TRAIN", 0.18, 10),
    TRUCK(4, "TRUCK", 0.22, 12),
    FOOT(5, "FOOT", 0.4, 20);

    private final int code;
    private final String label;
    private final double risk;
    private final int fatigue;

    public static VehicleType fromCode(Integer code) {
        if (code == null) {
            return PLANE;
        }
        for (VehicleType type : values()) {
            if (type.code == code) {
                return type;
            }
        }
        return PLANE;
    }
}
