package com.mapgame.modules.world.service;

import com.mapgame.modules.world.query.CityLevelUpgradeQuery;
import com.mapgame.modules.world.query.MapViewQuery;
import com.mapgame.modules.world.query.WorldHqLevelUpgradeQuery;
import com.mapgame.modules.world.enums.MapViewType;
import com.mapgame.modules.world.vo.CityVO;
import com.mapgame.modules.world.vo.MapViewVO;
import com.mapgame.modules.world.vo.RegionVO;
import com.mapgame.modules.world.vo.WorldBootstrapVO;
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

    /**
     * 将城市等级提升一级并持久化
     * @param worldId 世界ID
     * @param cityId 城市ID
     * @param query 升级参数
     * @return 更新后的城市信息
     */
    CityVO upgradeCityLevel(Long worldId, Long cityId, CityLevelUpgradeQuery query);

    /**
     * 将世界回合数推进 1
     * @param worldId 世界ID
     * @return 更新后的世界信息
     */
    WorldVO advanceWorldTurn(Long worldId);

    /**
     * 将主基地等级提升一级并持久化
     * @param worldId 世界ID
     * @param query 升级参数
     * @return 更新后的世界信息
     */
    WorldVO upgradeWorldHq(Long worldId, WorldHqLevelUpgradeQuery query);

    /**
     * 启动聚合：一次返回 world + regions + 默认视图
     * @param worldId 世界ID
     * @param viewType 视图类型（缺省 TRAVEL）
     * @return 聚合 VO
     */
    WorldBootstrapVO bootstrap(Long worldId, MapViewType viewType);
}
