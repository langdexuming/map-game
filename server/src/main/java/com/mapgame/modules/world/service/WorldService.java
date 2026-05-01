package com.mapgame.modules.world.service;

import com.mapgame.modules.world.query.MapViewQuery;
import com.mapgame.modules.world.vo.MapViewVO;
import com.mapgame.modules.world.vo.RegionVO;
import com.mapgame.modules.world.vo.WorldVO;

import java.util.List;

/**
 * 世界地图服务接口
 * @author make java
 * @since 2026-05-01
 */
public interface WorldService {

    /**
     * 获取世界基础信息
     * @param worldId 世界ID
     * @return 世界VO
     */
    WorldVO getWorld(Long worldId);

    /**
     * 列出该世界全部大陆 + 城市
     * @param worldId 世界ID
     * @return 大陆列表
     */
    List<RegionVO> listRegionsWithCities(Long worldId);

    /**
     * 切换视图返回视图增强数据
     * @param query 查询参数
     * @return 视图VO
     */
    MapViewVO getMapView(MapViewQuery query);
}
