package com.mapgame.modules.passport.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mapgame.common.api.ResultCode;
import com.mapgame.common.config.Configuration;
import com.mapgame.common.exception.BizException;
import com.mapgame.modules.passport.entity.MileageLog;
import com.mapgame.modules.passport.entity.Passport;
import com.mapgame.modules.passport.entity.PassportSpecialStamp;
import com.mapgame.modules.passport.entity.PassportStamp;
import com.mapgame.modules.passport.entity.PassportVisa;
import com.mapgame.modules.passport.mapper.MileageLogMapper;
import com.mapgame.modules.passport.mapper.PassportMapper;
import com.mapgame.modules.passport.mapper.PassportSpecialStampMapper;
import com.mapgame.modules.passport.mapper.PassportStampMapper;
import com.mapgame.modules.passport.mapper.PassportVisaMapper;
import com.mapgame.modules.passport.query.PassportVisaPurchaseQuery;
import com.mapgame.modules.passport.service.PassportService;
import com.mapgame.modules.passport.vo.PassportVO;
import com.mapgame.modules.player.entity.Player;
import com.mapgame.modules.player.mapper.PlayerMapper;
import com.mapgame.modules.travel.vo.TripPlanVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 护照服务实现
 * @author make java
 * @since 2026-06-11
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PassportServiceImpl implements PassportService {

    private static final Map<Long, VisaRequirement> VISA_REQUIREMENTS = Map.of(
            3L, new VisaRequirement(30, null),
            5L, new VisaRequirement(null, 200)
    );

    private final PassportMapper passportMapper;
    private final PassportStampMapper passportStampMapper;
    private final PassportVisaMapper passportVisaMapper;
    private final PassportSpecialStampMapper passportSpecialStampMapper;
    private final MileageLogMapper mileageLogMapper;
    private final PlayerMapper playerMapper;

    @Override
    public PassportVO getPassport(Long playerId) {
        Passport passport = loadOrCreate(playerId);
        return toVO(passport);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public PassportVO purchaseVisa(PassportVisaPurchaseQuery query) {
        if (query == null || query.getPlayerId() == null || query.getRegionId() == null) {
            throw new BizException(ResultCode.BIZ_PARAM_INVALID, "playerId、regionId 不能为空");
        }
        VisaRequirement req = VISA_REQUIREMENTS.get(query.getRegionId());
        if (req == null) {
            throw new BizException(ResultCode.BIZ_VISA_NOT_REQUIRED);
        }
        Passport passport = loadOrCreate(query.getPlayerId());
        QueryWrapper<PassportVisa> exists = new QueryWrapper<>();
        exists.eq("passport_id", passport.getId()).eq("region_id", query.getRegionId());
        if (!passportVisaMapper.selectList(exists).isEmpty()) {
            throw new BizException(ResultCode.BIZ_VISA_ALREADY);
        }
        Player player = playerMapper.selectById(query.getPlayerId());
        if (player == null) {
            throw new BizException(ResultCode.BIZ_NOT_FOUND, "玩家不存在");
        }
        if (req.clue != null && (player.getClue() == null ? 0 : player.getClue()) < req.clue) {
            throw new BizException(ResultCode.BIZ_NOT_ENOUGH_CLUE);
        }
        if (req.star != null && (player.getStar() == null ? 0 : player.getStar()) < req.star) {
            throw new BizException(ResultCode.BIZ_NOT_ENOUGH_STAR);
        }
        if (req.clue != null) {
            player.setClue(player.getClue() - req.clue);
        }
        if (req.star != null) {
            player.setStar(player.getStar() - req.star);
        }
        playerMapper.updateById(player);

        PassportVisa visa = new PassportVisa();
        visa.setPassportId(passport.getId());
        visa.setRegionId(query.getRegionId());
        passportVisaMapper.insert(visa);
        log.info("购买签证 playerId={} regionId={}", query.getPlayerId(), query.getRegionId());
        return toVO(passport);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void onTripArrived(Long playerId, Long tripId, Long regionId, int distance, TripPlanVO plan) {
        Passport passport = loadOrCreate(playerId);
        if (regionId != null) {
            QueryWrapper<PassportStamp> stampQuery = new QueryWrapper<>();
            stampQuery.eq("passport_id", passport.getId()).eq("region_id", regionId);
            if (passportStampMapper.selectList(stampQuery).isEmpty()) {
                PassportStamp stamp = new PassportStamp();
                stamp.setPassportId(passport.getId());
                stamp.setRegionId(regionId);
                passportStampMapper.insert(stamp);
            }
        }
        int mileage = (passport.getMileage() == null ? 0 : passport.getMileage()) + distance;
        passport.setMileage(mileage);
        if (mileage >= Configuration.PASSPORT_MILEAGE_GOLDEN) {
            passport.setGoldenCoating(1);
        }
        passportMapper.updateById(passport);

        MileageLog logEntry = new MileageLog();
        logEntry.setPassportId(passport.getId());
        logEntry.setTripId(tripId);
        logEntry.setDistance(distance);
        mileageLogMapper.insert(logEntry);

        if (plan != null && Boolean.TRUE.equals(plan.getTripleCombo())) {
            addSpecialStamp(passport.getId(), "triple-combo");
            Player player = playerMapper.selectById(playerId);
            if (player != null) {
                player.setStar((player.getStar() == null ? 0 : player.getStar()) + 10);
                playerMapper.updateById(player);
            }
        }
        log.info("行程到达盖章 playerId={} regionId={} mileage+{}", playerId, regionId, distance);
    }

    @Override
    public Set<Long> listVisaRegionIds(Long playerId) {
        Passport passport = loadOrCreate(playerId);
        QueryWrapper<PassportVisa> wrapper = new QueryWrapper<>();
        wrapper.eq("passport_id", passport.getId());
        Set<Long> result = new HashSet<>();
        for (PassportVisa visa : passportVisaMapper.selectList(wrapper)) {
            result.add(visa.getRegionId());
        }
        return result;
    }

    @Override
    public double ticketDiscount(Long playerId) {
        Passport passport = loadOrCreate(playerId);
        QueryWrapper<PassportStamp> wrapper = new QueryWrapper<>();
        wrapper.eq("passport_id", passport.getId());
        long stampCount = passportStampMapper.selectCount(wrapper);
        if (stampCount >= Configuration.PASSPORT_STAMP_GLOBAL) {
            return Configuration.PASSPORT_GLOBAL_DISCOUNT;
        }
        return 0;
    }

    private void addSpecialStamp(Long passportId, String key) {
        QueryWrapper<PassportSpecialStamp> wrapper = new QueryWrapper<>();
        wrapper.eq("passport_id", passportId).eq("stamp_key", key);
        if (!passportSpecialStampMapper.selectList(wrapper).isEmpty()) {
            return;
        }
        PassportSpecialStamp stamp = new PassportSpecialStamp();
        stamp.setPassportId(passportId);
        stamp.setStampKey(key);
        passportSpecialStampMapper.insert(stamp);
    }

    private Passport loadOrCreate(Long playerId) {
        QueryWrapper<Passport> wrapper = new QueryWrapper<>();
        wrapper.eq("player_id", playerId);
        Passport passport = passportMapper.selectOne(wrapper);
        if (passport != null) {
            return passport;
        }
        passport = new Passport();
        passport.setPlayerId(playerId);
        passport.setMileage(0);
        passport.setGoldenCoating(0);
        passportMapper.insert(passport);
        return passport;
    }

    private PassportVO toVO(Passport passport) {
        PassportVO vo = new PassportVO();
        vo.setPlayerId(passport.getPlayerId());
        vo.setMileage(passport.getMileage() == null ? 0 : passport.getMileage());
        vo.setGoldenCoating(Objects.equals(passport.getGoldenCoating(), 1));

        QueryWrapper<PassportStamp> stampQuery = new QueryWrapper<>();
        stampQuery.eq("passport_id", passport.getId());
        Map<Long, Boolean> stamps = new HashMap<>();
        for (PassportStamp stamp : passportStampMapper.selectList(stampQuery)) {
            stamps.put(stamp.getRegionId(), true);
        }
        vo.setStamps(stamps);

        QueryWrapper<PassportVisa> visaQuery = new QueryWrapper<>();
        visaQuery.eq("passport_id", passport.getId());
        Map<Long, Boolean> visas = new HashMap<>();
        for (PassportVisa visa : passportVisaMapper.selectList(visaQuery)) {
            visas.put(visa.getRegionId(), true);
        }
        vo.setVisas(visas);

        QueryWrapper<PassportSpecialStamp> specialQuery = new QueryWrapper<>();
        specialQuery.eq("passport_id", passport.getId());
        List<String> special = passportSpecialStampMapper.selectList(specialQuery).stream()
                .map(PassportSpecialStamp::getStampKey)
                .toList();
        vo.setSpecialStamps(special);

        boolean globalPass = stamps.size() >= Configuration.PASSPORT_STAMP_GLOBAL;
        vo.setGlobalPass(globalPass);
        vo.setTicketDiscount(globalPass ? Configuration.PASSPORT_GLOBAL_DISCOUNT : 0.0);
        return vo;
    }

    private record VisaRequirement(Integer clue, Integer star) {
    }
}
