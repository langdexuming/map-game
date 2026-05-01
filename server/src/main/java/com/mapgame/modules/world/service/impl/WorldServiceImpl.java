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
import com.mapgame.modules.world.query.MapViewQuery;
import com.mapgame.modules.world.service.WorldService;
import com.mapgame.modules.world.vo.CityVO;
import com.mapgame.modules.world.vo.MapViewVO;
import com.mapgame.modules.world.vo.RegionVO;
import com.mapgame.modules.world.vo.WorldVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
}
