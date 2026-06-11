package com.mapgame.modules.world.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mapgame.common.api.ResultCode;
import com.mapgame.common.exception.BizException;
import com.mapgame.modules.world.entity.City;
import com.mapgame.modules.world.entity.Region;
import com.mapgame.modules.world.entity.World;
import com.mapgame.modules.world.mapper.CityMapper;
import com.mapgame.modules.world.mapper.RegionMapper;
import com.mapgame.modules.world.mapper.WorldMapper;
import com.mapgame.modules.world.query.CityLevelUpgradeQuery;
import com.mapgame.modules.world.query.MapViewQuery;
import com.mapgame.modules.world.query.WorldHqLevelUpgradeQuery;
import com.mapgame.modules.agent.service.AgentService;
import com.mapgame.modules.travel.service.TravelService;
import com.mapgame.modules.world.service.WorldService;
import com.mapgame.modules.world.enums.MapViewType;
import com.mapgame.modules.world.vo.CityVO;
import com.mapgame.modules.world.vo.MapViewVO;
import com.mapgame.modules.world.vo.RegionVO;
import com.mapgame.modules.world.vo.WorldBootstrapVO;
import com.mapgame.modules.world.vo.WorldVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 世界地图服务实现
 * @author make java
 * @since 2026-05-01
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorldServiceImpl implements WorldService {

    private final WorldMapper worldMapper;
    private final RegionMapper regionMapper;
    private final CityMapper cityMapper;
    private final TravelService travelService;
    private final AgentService agentService;

    @Override
    public WorldVO getWorld(Long worldId) {
        World world = worldMapper.selectById(worldId);
        if (Objects.isNull(world)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "world id=" + worldId + " 不存在");
        }
        WorldVO vo = new WorldVO();
        BeanUtil.copyProperties(world, vo);
        return vo;
    }

    @Override
    public List<RegionVO> listRegionsWithCities(Long worldId) {
        if (Objects.isNull(worldId)) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "worldId 不能为空");
        }
        QueryWrapper<Region> rw = new QueryWrapper<>();
        rw.eq("world_id", worldId);
        List<Region> regions = regionMapper.selectList(rw);
        if (regions.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> regionIds = regions.stream().map(Region::getId).toList();
        QueryWrapper<City> cw = new QueryWrapper<>();
        cw.in("region_id", regionIds);
        List<City> allCities = cityMapper.selectList(cw);
        Map<Long, List<City>> grouped = allCities.stream().collect(Collectors.groupingBy(City::getRegionId));

        List<RegionVO> result = new ArrayList<>(regions.size());
        for (Region r : regions) {
            RegionVO rv = new RegionVO();
            BeanUtil.copyProperties(r, rv);
            List<City> rc = grouped.getOrDefault(r.getId(), new ArrayList<>());
            rv.setCities(rc.stream().map(this::toCityVO).toList());
            result.add(rv);
        }
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CityVO upgradeCityLevel(Long worldId, Long cityId, CityLevelUpgradeQuery query) {
        if (Objects.isNull(worldId) || Objects.isNull(cityId) || Objects.isNull(query) || Objects.isNull(query.getTargetLevel())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "worldId、cityId、targetLevel 不能为空");
        }
        City city = cityMapper.selectById(cityId);
        if (Objects.isNull(city)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "城市不存在 id=" + cityId);
        }
        Region region = regionMapper.selectById(city.getRegionId());
        if (Objects.isNull(region) || !Objects.equals(region.getWorldId(), worldId)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "城市不属于该世界");
        }
        int current = Objects.isNull(city.getLevel()) ? 1 : city.getLevel();
        int target = query.getTargetLevel();
        if (target > 5) {
            throw new BizException(ResultCode.BIZ_BUILDING_MAX, "城市等级已达上限");
        }
        if (target <= current) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "目标等级必须高于当前等级");
        }
        if (target != current + 1) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "每次仅能提升 1 级");
        }
        city.setLevel(target);
        cityMapper.updateById(city);
        log.info("城市升级 worldId={} cityId={} {} -> {}", worldId, cityId, current, target);
        return toCityVO(city);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorldVO advanceWorldTurn(Long worldId) {
        if (Objects.isNull(worldId)) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "worldId 不能为空");
        }
        World world = worldMapper.selectById(worldId);
        if (Objects.isNull(world)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "世界不存在 id=" + worldId);
        }
        int turn = Objects.isNull(world.getTurnNo()) ? 1 : world.getTurnNo();
        int nextTurn = turn + 1;
        world.setTurnNo(nextTurn);
        worldMapper.updateById(world);
        travelService.advanceTrips(worldId, nextTurn);
        agentService.advanceRestingAgents(nextTurn);
        log.info("世界推进回合 worldId={} {} -> {}", worldId, turn, nextTurn);
        return getWorld(worldId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WorldVO upgradeWorldHq(Long worldId, WorldHqLevelUpgradeQuery query) {
        if (Objects.isNull(worldId) || Objects.isNull(query) || Objects.isNull(query.getTargetLevel())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "worldId、targetLevel 不能为空");
        }
        World world = worldMapper.selectById(worldId);
        if (Objects.isNull(world)) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "世界不存在 id=" + worldId);
        }
        int current = Objects.isNull(world.getHqLevel()) ? 1 : world.getHqLevel();
        int target = query.getTargetLevel();
        if (target > 5) {
            throw new BizException(ResultCode.BIZ_BUILDING_MAX, "主基地等级已达上限");
        }
        if (target <= current) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "目标等级必须高于当前等级");
        }
        if (target != current + 1) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "每次仅能提升 1 级");
        }
        world.setHqLevel(target);
        worldMapper.updateById(world);
        log.info("主基地升级 worldId={} {} -> {}", worldId, current, target);
        return getWorld(worldId);
    }

    @Override
    public MapViewVO getMapView(MapViewQuery query) {
        if (Objects.isNull(query) || Objects.isNull(query.getWorldId()) || Objects.isNull(query.getViewType())) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "worldId/viewType 不能为空");
        }
        log.info("切换视图 worldId={}, viewType={}", query.getWorldId(), query.getViewType());

        List<RegionVO> regions = listRegionsWithCities(query.getWorldId());
        List<CityVO> cities = new ArrayList<>();
        for (RegionVO r : regions) {
            cities.addAll(r.getCities());
        }
        MapViewVO vo = new MapViewVO();
        vo.setViewType(query.getViewType());
        vo.setCities(cities);
        vo.setLayers(new ArrayList<>());
        return vo;
    }

    private CityVO toCityVO(City c) {
        CityVO v = new CityVO();
        BeanUtil.copyProperties(c, v);
        v.setUnlocked(Objects.equals(c.getUnlocked(), 1));
        return v;
    }

    @Override
    public WorldBootstrapVO bootstrap(Long worldId, MapViewType viewType) {
        MapViewType target = Objects.isNull(viewType) ? MapViewType.TRAVEL : viewType;
        WorldVO world = getWorld(worldId);
        List<RegionVO> regions = listRegionsWithCities(worldId);

        List<CityVO> cities = new ArrayList<>();
        for (RegionVO r : regions) {
            if (r.getCities() != null) {
                cities.addAll(r.getCities());
            }
        }
        MapViewVO mapView = new MapViewVO();
        mapView.setViewType(target);
        mapView.setCities(cities);
        mapView.setLayers(new ArrayList<>());

        WorldBootstrapVO vo = new WorldBootstrapVO();
        vo.setWorld(world);
        vo.setRegions(regions);
        vo.setMapView(mapView);
        return vo;
    }
}
