package com.mapgame.modules.player.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mapgame.modules.player.entity.Player;
import org.apache.ibatis.annotations.Mapper;

/**
 * 玩家 Mapper
 * @author make java
 * @since 2026-06-11
 */
@Mapper
public interface PlayerMapper extends BaseMapper<Player> {
}
