import {useEffect, useMemo, useRef, useState} from 'react';
import type {CityVO, MapViewType, MapViewVO, RegionVO, WorldVO} from '../api/types';
import {BizError} from '../api/http';
import {
  advanceWorldTurn,
  bootstrapWorld,
  getMapView,
  upgradeCityLevel,
  upgradeWorldHq,
} from '../api/world';
import {
  cityById as getMockCityById,
  getMockMapView,
  MOCK_REGIONS,
  MOCK_ROUTES,
  MOCK_WORLD,
  VEHICLE_COLOR,
  VEHICLE_DASH,
  VEHICLE_ICON,
} from '../game/mockData';
import {
  computeMissionPayout,
  createMissionBatch,
  createMissionSet,
  type MissionReward,
  type MissionRuntimeContext,
  type MissionState,
} from '../game/missions';
import {
  ActiveTrip,
  effectiveRouteTurn,
  formatChoice,
  pickRandomTripEvent,
  planTrip,
  routeUnlocked,
  type TripPlan,
} from '../game/travel';
import {cloneDefaultAgents, type Agent, vehicleSticker} from '../game/agents';
import {mustRestBeforeTravel as fatigueMustRest, restCoinCost, restFatiguePerTurn} from '../game/fatigue';
import {
  applyMileage,
  applyStamp,
  canPurchaseVisa,
  createInitialPassport,
  passportTicketDiscount,
  type PassportState,
  VISA_REQUIREMENTS,
} from '../game/passport';
import {buildScheduleSlots, nextDepartureOffset, slotPrice} from '../game/timetable';
import {createInitialWeather, isRouteBlocked, refreshWeather, shouldRefreshWeather, type WeatherState} from '../game/weather';
import {backdropUrlForRegionTheme} from '../game/visualSlots';
import {displayRegionName} from '../i18n/zhDisplay';
import {formatStr, STR} from '../i18n/strings';
import {buildCityProjection, regionCentroid} from '../map/projection';
import {cityRoutePath, clamp, movingPoint, routeSignature} from '../map/draw';
import {
  buildCityLevelSeed,
  cityLabel,
  cityUpgradeMaterials,
  DEFAULT_WORLD_ID,
  effectiveCityLevel,
  fuelCapForHq,
  INITIAL_RESOURCES,
  mergeCityIntoRegions,
  ticketDiscountForHq,
  upgradeMaterialsForNextHq,
} from './derive';

export interface PendingEvent {
  tripId: number;
  title: string;
  body: string;
  eventCode: string;
  d100: number;
  choices: Array<{
    key: string;
    label: string;
    requireCoin?: number;
    effect: {coin?: number; clue?: number; star?: number; fuel?: number; delay?: number; label?: string};
  }>;
}

export interface ResearchProgress {
  tech: number;
  logistics: number;
  intel: number;
  engineering: number;
}

export function useGameSession() {
  const t = STR;

  const [world, setWorld] = useState<WorldVO | null>(null);
  const [regions, setRegions] = useState<RegionVO[]>([]);
  const [mapView, setMapView] = useState<MapViewVO | null>(null);
  const [viewType, setViewType] = useState<MapViewType>('TRAVEL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [travelFromId, setTravelFromId] = useState<number | null>(null);
  const [travelToId, setTravelToId] = useState<number | null>(null);
  const [plannerPlans, setPlannerPlans] = useState<TripPlan[]>([]);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
  const [missions, setMissions] = useState<MissionState[]>([]);
  const [sessionVictory, setSessionVictory] = useState(false);
  const [hqLevel, setHqLevel] = useState(1);
  const [cityLevels, setCityLevels] = useState<Record<number, number>>({});
  const [advanceTurnBusy, setAdvanceTurnBusy] = useState(false);
  const [hqUpgradeBusy, setHqUpgradeBusy] = useState(false);
  const [cityUpgradeBusy, setCityUpgradeBusy] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([STR.logIntro1, STR.logIntro2]);
  const [agents, setAgents] = useState<Agent[]>(() => cloneDefaultAgents());
  const [passport, setPassport] = useState<PassportState>(() => createInitialPassport());
  const [weather, setWeather] = useState<WeatherState>(() => createInitialWeather());
  const [travelNews, setTravelNews] = useState<string[]>(['玩具群岛新货船抵达，票价下调 10%。', '风暴预警：北方航线可能受影响。']);
  const [researchProgress] = useState<ResearchProgress>({tech: 65, logistics: 48, intel: 72, engineering: 58});
  const [selectedPlanNo, setSelectedPlanNo] = useState<number | null>(null);
  const [selectedSlotOffset, setSelectedSlotOffset] = useState<number | null>(1);
  const [showPassport, setShowPassport] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [captainXp] = useState({current: 580, max: 1000});
  const [highlightMissionId, setHighlightMissionId] = useState<number | null>(null);

  const nextTripId = useRef(1);
  const nextMissionId = useRef(4);
  const skipViewFetchOnce = useRef(true);
  const turnAdvancing = useRef(false);
  const turnRef = useRef(INITIAL_RESOURCES.turn);

  turnRef.current = resources.turn;

  const fuelCap = useMemo(() => fuelCapForHq(hqLevel), [hqLevel]);
  const ticketDiscount = useMemo(
    () => ticketDiscountForHq(hqLevel) + passportTicketDiscount(passport),
    [hqLevel, passport],
  );

  const selectedPlan = useMemo(
    () => plannerPlans.find((plan) => plan.planNo === selectedPlanNo) ?? plannerPlans[0] ?? null,
    [plannerPlans, selectedPlanNo],
  );

  const scheduleSlots = useMemo(
    () => (selectedPlan ? buildScheduleSlots(selectedPlan.totalPrice) : []),
    [selectedPlan],
  );

  const selectedSlot = useMemo(
    () => scheduleSlots.find((slot) => slot.offset === selectedSlotOffset) ?? scheduleSlots[0] ?? null,
    [scheduleSlots, selectedSlotOffset],
  );

  const bookingPreview = useMemo(() => {
    if (!selectedPlan || !selectedSlot) {
      return null;
    }
    const price = slotPrice(selectedPlan.totalPrice, selectedSlot, false);
    return {
      price,
      fuel: selectedPlan.fuelCost,
      fatigue: selectedPlan.fatigueCost,
      canAffordCoin: resources.coin >= price,
      canAffordFuel: resources.fuel >= selectedPlan.fuelCost,
      fatigueBlocked: fatigueMustRest(agents[0].fatigue + selectedPlan.fatigueCost),
    };
  }, [selectedPlan, selectedSlot, resources.coin, resources.fuel, agents]);

  const nextScheduleTurn = useMemo(
    () =>
      nextDepartureOffset(
        resources.turn,
        activeTrips.filter((trip) => trip.status === 'BOOKED').map((trip) => ({departureTurn: trip.departureTurn})),
      ),
    [resources.turn, activeTrips],
  );

  useEffect(() => {
    const completed = missions.filter((m) => m.status === 'COMPLETED').length;
    if (completed >= 2 && resources.turn <= 8) {
      setSessionVictory(true);
    }
  }, [missions, resources.turn]);

  useEffect(() => {
    setCityLevels((prev) => {
      const next = {...prev};
      for (const region of regions) {
        for (const city of region.cities ?? []) {
          if (next[city.id] == null) {
            next[city.id] = city.level;
          }
        }
      }
      return next;
    });
  }, [regions]);

  function appendLog(message: string, displayTurn?: number) {
    const turnLabel = displayTurn ?? turnRef.current;
    setLogs((current) => [`${formatStr(t.turnNth, {n: turnLabel})} · ${message}`, ...current].slice(0, 14));
  }

  function loadFallbackData(nextViewType: MapViewType) {
    setUsingFallback(true);
    setSessionVictory(false);
    setHqLevel(MOCK_WORLD.hqLevel ?? 1);
    setWorld(MOCK_WORLD);
    setRegions(MOCK_REGIONS);
    setMapView(getMockMapView(nextViewType));
    setMissions(createMissionSet(MOCK_REGIONS.flatMap((region) => region.cities), 1));
    setCityLevels(buildCityLevelSeed(MOCK_REGIONS));
    nextMissionId.current = 4;
  }

  async function reloadAll() {
    setLoading(true);
    setError(null);
    try {
      const data = await bootstrapWorld(DEFAULT_WORLD_ID, viewType);
      setUsingFallback(false);
      setSessionVictory(false);
      setHqLevel(data.world.hqLevel ?? 1);
      setWorld(data.world);
      setRegions(data.regions);
      setMapView(data.mapView);
      setCityLevels(buildCityLevelSeed(data.regions));
      setResources((current) => ({
        ...current,
        turn: data.world.turnNo ?? 1,
      }));
      setMissions(createMissionSet(data.regions.flatMap((r) => r.cities), 1));
      nextMissionId.current = 4;
    } catch (e) {
      const message = e instanceof BizError ? `${e.message} (${e.code})` : String(e);
      setError(message);
      loadFallbackData(viewType);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipViewFetchOnce.current) {
      skipViewFetchOnce.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (usingFallback) {
        loadFallbackData(viewType);
        setLoading(false);
        return;
      }
      try {
        const v = await getMapView({worldId: DEFAULT_WORLD_ID, viewType});
        if (!cancelled) {
          setMapView(v);
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof BizError ? `${e.message} (${e.code})` : String(e);
          setError(message);
          loadFallbackData(viewType);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType]);

  const cityById = useMemo(() => {
    const map = new Map<number, CityVO>();
    for (const region of regions) {
      for (const city of region.cities ?? []) {
        map.set(city.id, city);
      }
    }
    return map;
  }, [regions]);

  const regionIdByCityId = useMemo(() => {
    const map = new Map<number, number>();
    for (const region of regions) {
      for (const city of region.cities ?? []) {
        map.set(city.id, region.id);
      }
    }
    return map;
  }, [regions]);

  const travelUnlock = useMemo(
    () => ({
      hqLevel,
      cityLevel: (id: number) => cityLevels[id] ?? cityById.get(id)?.level ?? 1,
      regionIdOfCity: (id: number) => regionIdByCityId.get(id),
      hasVisa: (regionId: number) => Boolean(passport.visas[regionId]),
    }),
    [hqLevel, cityLevels, cityById, regionIdByCityId, passport.visas],
  );

  const missionRuntimePreview = useMemo<MissionRuntimeContext>(
    () => ({
      hqLevel,
      cityLevel: (id: number) => cityLevels[id] ?? cityById.get(id)?.level ?? 1,
      clue: resources.clue,
      star: resources.star,
    }),
    [hqLevel, cityLevels, cityById, resources.clue, resources.star],
  );

  const mapBackdropStyle = useMemo(() => {
    const region = selectedCityId
      ? regions.find((item) => (item.cities ?? []).some((city) => city.id === selectedCityId))
      : regions[0];
    const fromApi = region?.mapBgUrl;
    const generated = region?.theme ? backdropUrlForRegionTheme(region.theme) : null;
    const url = fromApi ?? generated;
    if (!url) {
      return undefined;
    }
    return {
      backgroundImage: `radial-gradient(ellipse at center, rgba(246,235,210,0.15) 20%, rgba(140,98,57,0.25) 100%), linear-gradient(rgba(246,235,210,0.2), rgba(246,235,210,0.35)), url(${url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }, [regions, selectedCityId]);

  const regionNameByCityId = useMemo(() => {
    const map = new Map<number, string>();
    for (const region of regions) {
      for (const city of region.cities ?? []) {
        map.set(city.id, displayRegionName(region.name));
      }
    }
    return map;
  }, [regions]);

  const citiesForMap = useMemo(() => {
    const fromView = mapView?.cities;
    if (fromView != null && fromView.length > 0) {
      return fromView;
    }
    return regions.flatMap((region) => region.cities ?? []);
  }, [mapView?.cities, regions]);

  const selectedCity = selectedCityId != null ? cityById.get(selectedCityId) ?? null : null;
  const travelFrom = travelFromId != null ? cityById.get(travelFromId) ?? getMockCityById(travelFromId) ?? null : null;
  const travelTo = travelToId != null ? cityById.get(travelToId) ?? getMockCityById(travelToId) ?? null : null;

  const project = useMemo(() => buildCityProjection(citiesForMap), [citiesForMap]);

  const regionMarkers = useMemo(() => {
    if (!project) return [];
    return regions
      .map((region) => {
        const centroid = regionCentroid(region.cities ?? []);
        if (!centroid) return null;
        const point = project(centroid.lng, centroid.lat);
        return {id: region.id, name: displayRegionName(region.name), left: point.xPct, top: point.yPct};
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [regions, project]);

  const visibleRoutes = useMemo(() => {
    if (viewType !== 'TRAVEL' || !project) return [];
    const drawn = new Set<string>();
    return MOCK_ROUTES.flatMap((route) => {
      if (!routeUnlocked(route, travelUnlock)) return [];
      if (isRouteBlocked(route, weather)) return [];
      const key = routeSignature(route.fromCityId, route.toCityId, route.vehicleType);
      if (drawn.has(key)) return [];
      drawn.add(key);
      const fromCity = cityById.get(route.fromCityId);
      const toCity = cityById.get(route.toCityId);
      if (!fromCity || !toCity) return [];
      return [
        {
          key,
          path: cityRoutePath(fromCity, toCity, project),
          color: VEHICLE_COLOR[route.vehicleType],
          dash: VEHICLE_DASH[route.vehicleType],
        },
      ];
    });
  }, [cityById, project, viewType, travelUnlock, weather]);

  const blockedRoutes = useMemo(() => {
    if (viewType !== 'TRAVEL' || !project) return [];
    const drawn = new Set<string>();
    return MOCK_ROUTES.flatMap((route) => {
      if (!routeUnlocked(route, travelUnlock)) return [];
      if (!isRouteBlocked(route, weather)) return [];
      const key = routeSignature(route.fromCityId, route.toCityId, route.vehicleType);
      if (drawn.has(key)) return [];
      drawn.add(key);
      const fromCity = cityById.get(route.fromCityId);
      const toCity = cityById.get(route.toCityId);
      if (!fromCity || !toCity) return [];
      return [
        {
          key,
          path: cityRoutePath(fromCity, toCity, project),
          dash: VEHICLE_DASH[route.vehicleType],
        },
      ];
    });
  }, [cityById, project, viewType, travelUnlock, weather]);

  const highlightedMissionSegments = useMemo(() => {
    if (!highlightMissionId || !project) return [];
    const mission = missions.find((item) => item.id === highlightMissionId);
    if (!mission) return [];
    const result = planTrip(mission.fromCityId, mission.toCityId, {priceDiscount: ticketDiscount, unlock: travelUnlock});
    const routes = result.plans?.[0]?.routes ?? [];
    return routes
      .map((route, index) => {
        const fromCity = cityById.get(route.fromCityId);
        const toCity = cityById.get(route.toCityId);
        if (!fromCity || !toCity) return null;
        return {
          key: `mission-${mission.id}-${index}`,
          path: cityRoutePath(fromCity, toCity, project),
        };
      })
      .filter((segment): segment is NonNullable<typeof segment> => segment !== null);
  }, [highlightMissionId, missions, project, ticketDiscount, travelUnlock, cityById]);

  const highlightedTripSegments = useMemo(() => {
    if (!project) return [];
    return activeTrips
      .flatMap((trip) =>
        trip.plan.routes.map((route, index) => {
          const fromCity = cityById.get(route.fromCityId);
          const toCity = cityById.get(route.toCityId);
          if (!fromCity || !toCity) return null;
          return {
            key: `${trip.id}-${index}`,
            path: cityRoutePath(fromCity, toCity, project),
            color: trip.status === 'PAUSED' ? '#b45309' : '#dc2626',
          };
        }),
      )
      .filter((segment): segment is NonNullable<typeof segment> => segment !== null);
  }, [activeTrips, cityById, project]);

  const activeTripTokens = useMemo(() => {
    if (!project) return [];
    return activeTrips
      .filter((trip) => trip.status === 'IN_TRANSIT' || trip.status === 'PAUSED')
      .map((trip) => {
        const totalSteps = Math.max(1, trip.plan.totalTurn + trip.delayTurn);
        const progress = trip.elapsedTurn / totalSteps;
        let completedTurns = 0;
        let routeIndex = 0;
        while (
          routeIndex < trip.plan.routes.length - 1 &&
          completedTurns + effectiveRouteTurn(trip.plan.routes[routeIndex]) <= trip.elapsedTurn
        ) {
          completedTurns += effectiveRouteTurn(trip.plan.routes[routeIndex]);
          routeIndex += 1;
        }
        const route = trip.plan.routes[routeIndex];
        const fromCity = cityById.get(route.fromCityId);
        const toCity = cityById.get(route.toCityId);
        if (!fromCity || !toCity) return null;
        const segmentProgress = clamp(
          (trip.elapsedTurn - completedTurns) / Math.max(1, effectiveRouteTurn(route)),
          0,
          1,
        );
        const point = movingPoint(fromCity, toCity, project, segmentProgress);
        return {
          id: trip.id,
          point,
          icon: VEHICLE_ICON[route.vehicleType],
          progress: Math.round(clamp(progress, 0, 1) * 100),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [activeTrips, cityById, project]);

  function syncAgentsWithTrips(trips: ActiveTrip[]) {
    setAgents((current) =>
      current.map((agent) => {
        const trip = trips.find((item) => item.leadAgentId === agent.id);
        if (!trip) {
          if (agent.status === 'IN_TRANSIT') {
            const nextFatigue = agent.fatigue;
            return {
              ...agent,
              status: nextFatigue >= 70 ? 'NEED_REST' : 'STANDBY',
              assignedTripId: undefined,
              vehicleSticker: undefined,
              turnsRemaining: undefined,
            };
          }
          return agent;
        }
        if (trip.status === 'BOOKED') {
          return {
            ...agent,
            status: 'STANDBY',
            assignedTripId: trip.id,
            vehicleSticker: vehicleSticker(trip.plan.vehicleChain[0]),
            turnsRemaining: Math.max(0, trip.departureTurn - turnRef.current) + trip.plan.totalTurn,
          };
        }
        const remaining = Math.max(0, trip.plan.totalTurn + trip.delayTurn - trip.elapsedTurn);
        return {
          ...agent,
          status: 'IN_TRANSIT',
          assignedTripId: trip.id,
          vehicleSticker: vehicleSticker(trip.plan.vehicleChain[Math.min(trip.plan.vehicleChain.length - 1, Math.floor(trip.elapsedTurn / 2))]),
          turnsRemaining: remaining,
        };
      }),
    );
  }

  function resetTravelSelection(keepSelectedCity = true) {
    setTravelFromId(null);
    setTravelToId(null);
    setPlannerPlans([]);
    setSelectedPlanNo(null);
    setSelectedSlotOffset(1);
    setHighlightMissionId(null);
    if (!keepSelectedCity) {
      setSelectedCityId(null);
    }
  }

  function focusMissionRoute(missionId: number) {
    const mission = missions.find((item) => item.id === missionId);
    if (!mission) {
      return;
    }
    setHighlightMissionId(missionId);
    if (viewType !== 'TRAVEL') {
      setViewType('TRAVEL');
    }
    const from = cityById.get(mission.fromCityId);
    const to = cityById.get(mission.toCityId);
    if (!from || !to) {
      return;
    }
    if (!from.unlocked || !to.unlocked) {
      appendLog(t.cityLockedTrip);
      return;
    }
    setSelectedCityId(from.id);
    setTravelFromId(from.id);
    const result = planTrip(from.id, to.id, {priceDiscount: ticketDiscount, unlock: travelUnlock});
    if (result.error) {
      appendLog(formatStr(t.logPlanFailed, {reason: result.error}));
      setTravelToId(null);
      setPlannerPlans([]);
      return;
    }
    setTravelToId(to.id);
    setPlannerPlans(result.plans ?? []);
    setSelectedPlanNo(result.plans?.[0]?.planNo ?? null);
    setSelectedSlotOffset(1);
  }

  function resetRun() {
    setResources(INITIAL_RESOURCES);
    setSessionVictory(false);
    setHqLevel(1);
    setActiveTrips([]);
    setPendingEvent(null);
    setAgents(cloneDefaultAgents());
    setPassport(createInitialPassport());
    setWeather(createInitialWeather());
    setTravelNews(['玩具群岛新货船抵达，票价下调 10%。', '风暴预警：北方航线可能受影响。']);
    setShowPassport(false);
    setShowTimetable(false);
    setHighlightMissionId(null);
    resetTravelSelection(false);
    setLogs([t.logIntro1, t.logIntro2]);
    const nextCities = regions.length > 0 ? regions.flatMap((r) => r.cities ?? []) : MOCK_REGIONS.flatMap((r) => r.cities);
    const sourceRegions = regions.length > 0 ? regions : MOCK_REGIONS;
    setCityLevels(buildCityLevelSeed(sourceRegions));
    setMissions(createMissionSet(nextCities, 1));
    nextTripId.current = 1;
    nextMissionId.current = 4;
    setWorld((current) => (current ? {...current, turnNo: 1, hqLevel: 1} : current));
  }

  async function upgradeHq() {
    if (hqUpgradeBusy) return;
    const cost = upgradeMaterialsForNextHq(hqLevel);
    if (cost == null) {
      appendLog(t.baseMax);
      return;
    }
    if (resources.coin < cost.coin || resources.clue < cost.clue || resources.star < cost.star) {
      appendLog(`${t.baseCostDetail} ${cost.coin} ${t.labelCoins} / ${cost.clue} ${t.labelClues} / ${cost.star} ${t.labelStars}`);
      return;
    }
    const nextLevel = hqLevel + 1;
    const nextCap = fuelCapForHq(nextLevel);

    if (!usingFallback) {
      setHqUpgradeBusy(true);
      try {
        const w = await upgradeWorldHq(DEFAULT_WORLD_ID, {targetLevel: nextLevel});
        setResources((current) => ({
          ...current,
          coin: current.coin - cost.coin,
          clue: current.clue - cost.clue,
          star: current.star - cost.star,
          fuel: Math.min(nextCap, current.fuel + 25),
        }));
        setHqLevel(w.hqLevel ?? nextLevel);
        setWorld(w);
        appendLog(
          formatStr(t.logHqUpgradedSynced, {
            level: w.hqLevel ?? nextLevel,
            capLabel: t.baseFuelCap,
            cap: nextCap,
            synced: t.baseSynced,
          }),
        );
      } catch (e) {
        const message = e instanceof BizError ? `${e.message} (${e.code})` : String(e);
        appendLog(`${t.baseUpgradeFail}：${message}`);
      } finally {
        setHqUpgradeBusy(false);
      }
      return;
    }

    setResources((current) => ({
      ...current,
      coin: current.coin - cost.coin,
      clue: current.clue - cost.clue,
      star: current.star - cost.star,
      fuel: Math.min(nextCap, current.fuel + 25),
    }));
    setHqLevel(nextLevel);
    appendLog(formatStr(t.logHqUpgraded, {level: nextLevel, capLabel: t.baseFuelCap, cap: nextCap}));
  }

  async function upgradeSelectedCity() {
    if (cityUpgradeBusy) return;
    if (!selectedCity) {
      appendLog(t.selectCity);
      return;
    }
    if (!selectedCity.unlocked) {
      appendLog(t.cityLockedTrip);
      return;
    }
    const currentLv = effectiveCityLevel(selectedCity, cityLevels);
    const cost = cityUpgradeMaterials(currentLv);
    if (cost == null) {
      appendLog(t.cityMax);
      return;
    }
    if (resources.coin < cost.coin || resources.clue < cost.clue || resources.star < cost.star) {
      appendLog(`${t.cityUpgradeNeed} ${cost.coin} ${t.labelCoins} / ${cost.clue} ${t.labelClues} / ${cost.star} ${t.labelStars}`);
      return;
    }

    if (!usingFallback) {
      setCityUpgradeBusy(true);
      try {
        const vo = await upgradeCityLevel(DEFAULT_WORLD_ID, selectedCity.id, {targetLevel: currentLv + 1});
        setResources((current) => ({
          ...current,
          coin: current.coin - cost.coin,
          clue: current.clue - cost.clue,
          star: current.star - cost.star,
        }));
        setCityLevels((prev) => ({...prev, [selectedCity.id]: vo.level}));
        setRegions((prev) => mergeCityIntoRegions(prev, vo));
        appendLog(
          formatStr(t.logCityUpgradedSynced, {
            city: cityLabel(selectedCity),
            done: t.cityUpgradeDone,
            level: vo.level,
            synced: t.citySynced,
          }),
        );
      } catch (e) {
        const message = e instanceof BizError ? `${e.message} (${e.code})` : String(e);
        appendLog(`${t.cityUpgradeFail}：${message}`);
      } finally {
        setCityUpgradeBusy(false);
      }
      return;
    }

    setResources((current) => ({
      ...current,
      coin: current.coin - cost.coin,
      clue: current.clue - cost.clue,
      star: current.star - cost.star,
    }));
    setCityLevels((prev) => ({...prev, [selectedCity.id]: currentLv + 1}));
    appendLog(formatStr(t.logCityUpgraded, {city: cityLabel(selectedCity), done: t.cityUpgradeDone, level: currentLv + 1}));
  }

  function handleCityClick(city: CityVO) {
    setSelectedCityId(city.id);
    setHighlightMissionId(null);
    if (travelFromId == null) {
      if (!city.unlocked) {
        appendLog(t.cityLockedTrip);
        return;
      }
      setTravelFromId(city.id);
      setTravelToId(null);
      setPlannerPlans([]);
      return;
    }
    if (travelFromId === city.id) {
      resetTravelSelection();
      return;
    }
    if (!city.unlocked) {
      appendLog(t.cityLockedTrip);
      return;
    }
    const result = planTrip(travelFromId, city.id, {priceDiscount: ticketDiscount, unlock: travelUnlock});
    if (result.error) {
      appendLog(formatStr(t.logPlanFailed, {reason: result.error}));
      resetTravelSelection();
      return;
    }
    setTravelToId(city.id);
    setPlannerPlans(result.plans ?? []);
    setSelectedPlanNo(result.plans?.[0]?.planNo ?? null);
    setSelectedSlotOffset(1);
  }

  function selectPlan(planNo: number) {
    setSelectedPlanNo(planNo);
  }

  function selectScheduleSlot(offset: number) {
    setSelectedSlotOffset(offset);
  }

  function confirmBooking(force = false, planOverride?: TripPlan, slotOverride?: ReturnType<typeof buildScheduleSlots>[number]) {
    const plan = planOverride ?? selectedPlan;
    const slot = slotOverride ?? selectedSlot;
    if (!travelFrom || !travelTo || !plan || !slot) {
      return;
    }
    const leadAgent = agents[0];
    const price = slotPrice(plan.totalPrice, slot, false);
    const preview = {
      price,
      fuel: plan.fuelCost,
      fatigue: plan.fatigueCost,
      canAffordCoin: resources.coin >= price,
      canAffordFuel: resources.fuel >= plan.fuelCost,
    };
    const wasFatigued = fatigueMustRest(leadAgent.fatigue + plan.fatigueCost);
    if (!force && wasFatigued) {
      appendLog(t.insufficientFatigue);
      return;
    }
    if (force && wasFatigued) {
      appendLog(formatStr(t.logAgentForce, {name: leadAgent.name}));
    }
    if (!preview.canAffordCoin) {
      appendLog(formatStr(t.logInsufficientCoin, {need: preview.price, have: resources.coin}));
      return;
    }
    if (!preview.canAffordFuel) {
      appendLog(formatStr(t.logInsufficientFuel, {need: preview.fuel, have: resources.fuel}));
      return;
    }
    const clueBonus = plan.transferCombo ? 0 : plan.planStyle === 'CHEAP' ? 1 : 0;
    setResources((current) => ({
      ...current,
      coin: current.coin - preview.price,
      fuel: Math.max(0, current.fuel - preview.fuel),
      clue: current.clue + clueBonus,
    }));
    setAgents((current) =>
      current.map((agent, index) =>
        index === 0
          ? {
              ...agent,
              fatigue: Math.min(100, agent.fatigue + plan.fatigueCost),
              wit: force && wasFatigued ? Math.max(0, agent.wit - 1) : agent.wit,
              guard: force && wasFatigued ? Math.max(0, agent.guard - 1) : agent.guard,
              stamina: force && wasFatigued ? Math.max(0, agent.stamina - 1) : agent.stamina,
              status: 'STANDBY',
            }
          : agent,
      ),
    );
    const trip: ActiveTrip = {
      id: nextTripId.current,
      from: travelFrom,
      to: travelTo,
      plan,
      elapsedTurn: 0,
      delayTurn: 0,
      status: 'BOOKED',
      departureTurn: resources.turn + slot.offset,
      scheduleOffset: slot.offset,
      paidPrice: preview.price,
      leadAgentId: leadAgent.id,
      forceDepart: force && wasFatigued,
    };
    nextTripId.current += 1;
    setActiveTrips((current) => {
      const next = [trip, ...current];
      syncAgentsWithTrips(next);
      return next;
    });
    appendLog(
      formatStr(t.logTripBooked, {
        id: trip.id,
        offset: slot.offset,
      }),
    );
    resetTravelSelection();
  }

  function bookPlan(plan: TripPlan) {
    const slots = buildScheduleSlots(plan.totalPrice);
    confirmBooking(false, plan, slots[0]);
  }

  function cancelTrip(tripId: number) {
    const trip = activeTrips.find((item) => item.id === tripId && item.status === 'BOOKED');
    if (!trip) {
      return;
    }
    const fee = Math.round(trip.paidPrice * 0.3);
    const refund = Math.max(0, trip.paidPrice - fee);
    setResources((current) => ({...current, coin: current.coin + refund}));
    setActiveTrips((current) => {
      const next = current.filter((item) => item.id !== tripId);
      syncAgentsWithTrips(next);
      return next;
    });
    appendLog(formatStr(t.logTripCancelled, {id: tripId, fee, refund}));
  }

  function rescheduleTrip(tripId: number, newOffset: number) {
    const trip = activeTrips.find((item) => item.id === tripId && item.status === 'BOOKED');
    if (!trip) {
      return;
    }
    const fee = Math.round(trip.paidPrice * 0.3);
    if (resources.coin < fee) {
      appendLog(formatStr(t.logInsufficientCoin, {need: fee, have: resources.coin}));
      return;
    }
    setResources((current) => ({...current, coin: current.coin - fee}));
    setActiveTrips((current) => {
      const next = current.map((item) =>
        item.id === tripId
          ? {
              ...item,
              departureTurn: resources.turn + newOffset,
              scheduleOffset: newOffset,
            }
          : item,
      );
      syncAgentsWithTrips(next);
      return next;
    });
    appendLog(formatStr(t.logTripRescheduled, {id: tripId, fee, offset: newOffset}));
  }

  function restAgent(agentId: number, atHq = false) {
    const cost = restCoinCost(atHq);
    if (!atHq && resources.coin < cost) {
      appendLog(formatStr(t.logInsufficientCoin, {need: cost, have: resources.coin}));
      return;
    }
    setResources((current) => ({...current, coin: atHq ? current.coin : current.coin - cost}));
    setAgents((current) =>
      current.map((agent) => {
        if (agent.id !== agentId) {
          return agent;
        }
        const nextFatigue = Math.max(0, agent.fatigue - restFatiguePerTurn(atHq));
        return {
          ...agent,
          fatigue: nextFatigue,
          status: nextFatigue <= 0 ? 'STANDBY' : 'RESTING',
        };
      }),
    );
    const agent = agents.find((item) => item.id === agentId);
    if (agent) {
      appendLog(formatStr(t.logAgentRest, {name: agent.name}));
    }
  }

  function purchaseVisa(regionId: number) {
    if (!canPurchaseVisa(regionId, resources, passport)) {
      return;
    }
    const req = VISA_REQUIREMENTS[regionId];
    if (!req) {
      return;
    }
    setResources((current) => ({
      ...current,
      clue: req.clue != null ? current.clue - req.clue : current.clue,
      star: req.star != null ? current.star - req.star : current.star,
    }));
    setPassport((current) => ({...current, visas: {...current.visas, [regionId]: true}}));
  }

  function handleTripArrival(trip: ActiveTrip, nextTurnNo: number) {
    const region = regions.find((item) => (item.cities ?? []).some((city) => city.id === trip.to.id));
    if (region) {
      setPassport((current) => {
        let next = applyStamp(current, region.id);
        const distance = trip.plan.routes.reduce((sum, route) => sum + route.distance, 0);
        next = applyMileage(next, distance);
        return next;
      });
      appendLog(formatStr(t.logPassportStamp, {region: displayRegionName(region.name)}), nextTurnNo);
      appendLog(formatStr(t.logMileageGain, {n: trip.plan.routes.reduce((sum, route) => sum + route.distance, 0)}), nextTurnNo);
    }
    if (trip.plan.transferCombo) {
      setResources((current) => ({...current, clue: current.clue + 1}));
      appendLog(t.logComboTransfer, nextTurnNo);
    }
    if (trip.plan.tripleCombo) {
      setResources((current) => ({...current, star: current.star + 10}));
      appendLog(t.logComboTriple, nextTurnNo);
    }
  }

  function switchView(next: MapViewType) {
    if (next === viewType) return;
    setViewType(next);
    resetTravelSelection(false);
  }

  function applyEffect(effect: {coin?: number; clue?: number; star?: number; fuel?: number}) {
    setResources((current) => {
      const cap = fuelCapForHq(hqLevel);
      return {
        ...current,
        coin: Math.max(0, current.coin + (effect.coin ?? 0)),
        clue: Math.max(0, current.clue + (effect.clue ?? 0)),
        star: Math.max(0, current.star + (effect.star ?? 0)),
        fuel: Math.min(cap, Math.max(0, current.fuel + (effect.fuel ?? 0))),
      };
    });
  }

  function resolveInteractiveChoice(choiceKey: string) {
    if (!pendingEvent) return;
    const choice = pendingEvent.choices.find((c) => c.key === choiceKey);
    if (!choice) return;
    if (choice.requireCoin != null && resources.coin < choice.requireCoin) {
      appendLog(formatStr(t.logCannotAffordChoice, {coin: choice.requireCoin}));
      return;
    }
    applyEffect(choice.effect);
    setActiveTrips((current) =>
      current.map((trip) =>
        trip.id === pendingEvent.tripId
          ? {
              ...trip,
              status: 'IN_TRANSIT',
              delayTurn: trip.delayTurn + (choice.effect.delay ?? 0),
            }
          : trip,
      ),
    );
    appendLog(formatStr(t.logTripChoice, {id: pendingEvent.tripId, detail: formatChoice(choice)}));
    setPendingEvent(null);
  }

  function settleMissionRewardPayload(reward: MissionReward) {
    setResources((current) => {
      const cap = fuelCapForHq(hqLevel);
      return {
        ...current,
        coin: current.coin + reward.coin,
        clue: current.clue + reward.clue,
        star: current.star + reward.star,
        fuel: Math.min(cap, current.fuel + (reward.fuel ?? 0)),
      };
    });
  }

  async function advanceTurn() {
    if (turnAdvancing.current) return;
    if (pendingEvent) {
      appendLog(t.logPendingEventBlock);
      return;
    }
    turnAdvancing.current = true;
    setAdvanceTurnBusy(true);
    try {
      let nextTurnNo = resources.turn + 1;
      if (!usingFallback) {
        try {
          const w = await advanceWorldTurn(DEFAULT_WORLD_ID);
          setWorld(w);
          nextTurnNo = w.turnNo ?? nextTurnNo;
        } catch (e) {
          const message = e instanceof BizError ? `${e.message} (${e.code})` : String(e);
          appendLog(`${t.turnSyncFail}：${message}`);
          return;
        }
      }

      let nextPendingEvent: PendingEvent | null = null;
      const logsToAppend: string[] = [];
      const resourceDelta = {coin: 0, clue: 0, star: 0, fuel: 0};
      const arrivedTrips: ActiveTrip[] = [];

      if (shouldRefreshWeather(nextTurnNo)) {
        const nextWeather = refreshWeather(nextTurnNo, MOCK_ROUTES);
        setWeather(nextWeather);
        setTravelNews((current) => [nextWeather.previewMessage ?? t.weatherPreview, ...current].slice(0, 4));
        logsToAppend.push(formatStr(t.logWeatherRefresh, {message: nextWeather.activeMessage ?? t.weatherActive}));
      }

      setActiveTrips((current) => {
        const nextTrips: ActiveTrip[] = [];
        for (const trip of current) {
          let nextTrip = {...trip};
          if (nextTrip.status === 'PAUSED') {
            nextTrips.push(nextTrip);
            continue;
          }
          if (nextTrip.status === 'BOOKED') {
            if (nextTurnNo >= nextTrip.departureTurn) {
              nextTrip.status = 'IN_TRANSIT';
              nextTrip.elapsedTurn = 0;
              logsToAppend.push(formatStr(t.logTripDepart, {id: nextTrip.id}));
            } else {
              nextTrips.push(nextTrip);
              continue;
            }
          }

          if (nextTrip.status === 'IN_TRANSIT') {
            nextTrip.elapsedTurn += 1;
            if (Math.random() < (nextTrip.forceDepart ? 0.35 : 0.25)) {
              const rolled = pickRandomTripEvent();
              const event = rolled.event;
              nextTrip.lastEventCode = event.code;
              nextTrip.d100Roll = rolled.d100;
              if (event.code !== 'NONE') {
                if (event.interactive && event.choices && !nextPendingEvent) {
                  nextTrip.status = 'PAUSED';
                  nextPendingEvent = {
                    tripId: nextTrip.id,
                    title: event.title,
                    body: event.body,
                    eventCode: event.code,
                    d100: rolled.d100,
                    choices: event.choices,
                  };
                  logsToAppend.push(formatStr(t.logTripEvent, {id: nextTrip.id, title: event.title}));
                } else if (event.effect) {
                  resourceDelta.coin += event.effect.coin ?? 0;
                  resourceDelta.clue += event.effect.clue ?? 0;
                  resourceDelta.star += event.effect.star ?? 0;
                  resourceDelta.fuel += event.effect.fuel ?? 0;
                  nextTrip.delayTurn += event.effect.delay ?? 0;
                  logsToAppend.push(formatStr(t.logTripEventDetail, {id: nextTrip.id, title: event.title, body: event.body}));
                }
              }
            }
          }

          if (nextTrip.status !== 'PAUSED' && nextTrip.elapsedTurn >= nextTrip.plan.totalTurn + nextTrip.delayTurn) {
            logsToAppend.push(formatStr(t.logTripArrived, {id: nextTrip.id, city: cityLabel(nextTrip.to)}));
            arrivedTrips.push(nextTrip);
            continue;
          }
          nextTrips.push(nextTrip);
        }
        syncAgentsWithTrips(nextTrips);
        return nextTrips;
      });

      if (resourceDelta.coin || resourceDelta.clue || resourceDelta.star || resourceDelta.fuel) {
        applyEffect(resourceDelta);
      }

      const missionCtx: MissionRuntimeContext = {
        hqLevel,
        cityLevel: (id: number) => cityLevels[id] ?? cityById.get(id)?.level ?? 1,
        clue: resources.clue + resourceDelta.clue,
        star: resources.star + resourceDelta.star,
      };

      const missionRefreshLogs: string[] = [];
      if (arrivedTrips.length > 0) {
        for (const trip of arrivedTrips) {
          handleTripArrival(trip, nextTurnNo);
        }
        setMissions((current) =>
          current.flatMap((mission) => {
            if (mission.status !== 'OPEN') return [mission];
            const matchedTrip = arrivedTrips.find(
              (trip) => trip.from.id === mission.fromCityId && trip.to.id === mission.toCityId,
            );
            if (!matchedTrip) return [mission];
            const completedOnTime = nextTurnNo <= mission.deadlineTurn;
            if (completedOnTime) {
              const {reward, tier} = computeMissionPayout(mission, missionCtx);
              settleMissionRewardPayload(reward);
              if (tier === 'partial') {
                logsToAppend.push(`${t.missionPartialReward}：${mission.title}`);
              } else {
                logsToAppend.push(formatStr(t.logMissionComplete, {title: mission.title}));
              }
              const replacement = createMissionBatch(
                citiesForMap,
                nextTurnNo,
                nextMissionId.current,
                1,
                current.filter((i) => i.status === 'OPEN').map((i) => `${i.fromCityId}-${i.toCityId}`),
              );
              nextMissionId.current += replacement.length;
              if (replacement.length > 0) {
                missionRefreshLogs.push(`${t.missionRefresh}：${replacement[0].title}`);
              }
              return [{...mission, status: 'COMPLETED'}, ...replacement];
            }
            logsToAppend.push(formatStr(t.logMissionTimeout, {title: mission.title}));
            const replacement = createMissionBatch(
              citiesForMap,
              nextTurnNo,
              nextMissionId.current,
              1,
              current.filter((i) => i.status === 'OPEN').map((i) => `${i.fromCityId}-${i.toCityId}`),
            );
            nextMissionId.current += replacement.length;
            if (replacement.length > 0) {
              missionRefreshLogs.push(`${t.missionRefresh}：${replacement[0].title}`);
            }
            return [{...mission, status: 'FAILED'}, ...replacement];
          }),
        );
      }

      setResources((current) => {
        const cap = fuelCapForHq(hqLevel);
        const regen = 6 + hqLevel * 2;
        return {
          ...current,
          turn: nextTurnNo,
          fuel: Math.min(cap, current.fuel + regen),
        };
      });
      if (usingFallback) {
        setWorld((current) => (current ? {...current, turnNo: nextTurnNo} : current));
      }
      setPendingEvent(nextPendingEvent);
      setMissions((current) =>
        current.map((m) =>
          m.status === 'OPEN' && m.deadlineTurn < nextTurnNo ? {...m, status: 'FAILED'} : m,
        ),
      );
      for (const line of logsToAppend) appendLog(line, nextTurnNo);
      for (const line of missionRefreshLogs) appendLog(line, nextTurnNo);
      appendLog(t.turnAdvanceDone, nextTurnNo);
    } finally {
      turnAdvancing.current = false;
      setAdvanceTurnBusy(false);
    }
  }

  const missionStats = useMemo(() => {
    const completed = missions.filter((m) => m.status === 'COMPLETED').length;
    const failed = missions.filter((m) => m.status === 'FAILED').length;
    const goalMet = completed >= 2 && resources.turn <= 8;
    const goalMissed = resources.turn > 8 && completed < 2;
    return {completed, failed, goalMet, goalMissed};
  }, [missions, resources.turn]);

  const runResolved = missionStats.goalMet || missionStats.goalMissed;
  const nextHqMaterials = useMemo(() => upgradeMaterialsForNextHq(hqLevel), [hqLevel]);

  return {
    t,
    world,
    regions,
    mapView,
    viewType,
    loading,
    error,
    usingFallback,
    selectedCityId,
    selectedCity,
    travelFromId,
    travelToId,
    travelFrom,
    travelTo,
    plannerPlans,
    resources,
    activeTrips,
    missions,
    sessionVictory,
    hqLevel,
    cityLevels,
    advanceTurnBusy,
    hqUpgradeBusy,
    cityUpgradeBusy,
    pendingEvent,
    logs,
    fuelCap,
    ticketDiscount,
    cityById,
    citiesForMap,
    project,
    regionMarkers,
    visibleRoutes,
    blockedRoutes,
    highlightedTripSegments,
    highlightedMissionSegments,
    activeTripTokens,
    mapBackdropStyle,
    regionNameByCityId,
    missionRuntimePreview,
    missionStats,
    runResolved,
    nextHqMaterials,
    agents,
    passport,
    weather,
    travelNews,
    researchProgress,
    selectedPlanNo,
    selectedPlan,
    selectedSlotOffset,
    selectedSlot,
    scheduleSlots,
    bookingPreview,
    showPassport,
    showTimetable,
    captainXp,
    nextScheduleTurn,
    highlightMissionId,
    reloadAll,
    switchView,
    handleCityClick,
    bookPlan,
    confirmBooking,
    selectPlan,
    selectScheduleSlot,
    advanceTurn,
    upgradeHq,
    upgradeSelectedCity,
    resolveInteractiveChoice,
    resetRun,
    resetTravelSelection,
    setSelectedCityId,
    setShowPassport,
    setShowTimetable,
    restAgent,
    purchaseVisa,
    focusMissionRoute,
    cancelTrip,
    rescheduleTrip,
    setHighlightMissionId,
  };
}

export type GameSession = ReturnType<typeof useGameSession>;
