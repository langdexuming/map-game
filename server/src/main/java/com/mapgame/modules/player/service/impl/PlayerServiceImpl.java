package com.mapgame.modules.player.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.mapgame.common.api.ResultCode;
import com.mapgame.common.exception.BizException;
import com.mapgame.modules.player.entity.Player;
import com.mapgame.modules.player.mapper.PlayerMapper;
import com.mapgame.modules.player.service.PlayerService;
import com.mapgame.modules.player.vo.PlayerVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * 玩家服务实现
 * @author make java
 * @since 2026-06-11
 */
@Service
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {

    private final PlayerMapper playerMapper;

    @Override
    public PlayerVO getPlayer(Long playerId) {
        Player player = playerMapper.selectById(playerId);
        if (Objects.isNull(player)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "玩家不存在 id=" + playerId);
        }
        PlayerVO vo = new PlayerVO();
        BeanUtil.copyProperties(player, vo);
        return vo;
    }
}
