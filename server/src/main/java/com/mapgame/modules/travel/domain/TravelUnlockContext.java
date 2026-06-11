package com.mapgame.modules.travel.domain;

import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.util.function.Function;

/**
 * 出行解锁上下文
 * @author make java
 * @since 2026-06-11
 */
@Data
@Builder
public class TravelUnlockContext {

    private int hqLevel;

    private Function<Long, Integer> cityLevel;

    private Function<Long, Long> regionIdOfCity;

    private Set<Long> visaRegionIds;

    private double priceDiscount;
}
