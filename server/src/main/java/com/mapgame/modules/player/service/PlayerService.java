package com.mapgame.modules.player.service;

import com.mapgame.modules.player.vo.PlayerVO;

/**
 * 玩家服务
 * @author make java
 * @since 2026-06-11
 */
public interface PlayerService {

    /**
     * 获取玩家资源
     * @param playerId 玩家ID
     * @return 玩家视图
     */
    PlayerVO getPlayer(Long playerId);
}
