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
  choices: Array<{
    key: string;
    label: string;
    requireCoin?: number;
    effect: {coin?: number; clue?: number; star?: number; fuel?: number; delay?: number; label?: string};
  }>;
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

  const nextTripId = useRef(1);
  const nextMissionId = useRef(4);
  const skipViewFetchOnce = useRef(true);
  const turnAdvancing = useRef(false);
  const turnRef = useRef(INITIAL_RESOURCES.turn);

  turnRef.current = resources.turn;

  const fuelCap = useMemo(() => fuelCapForHq(hqLevel), [hqLevel]);
  const ticketDiscount = useMemo(() => ticketDiscountForHq(hqLevel), [hqLevel]);

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

  const travelUnlock = useMemo(
    () => ({
      hqLevel,
      cityLevel: (id: number) => cityLevels[id] ?? cityById.get(id)?.level ?? 1,
    }),
    [hqLevel, cityLevels, cityById],
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
      backgroundImage: `radial-gradient(ellipse at center, rgba(10,10,14,0) 30%, rgba(10,10,14,0.55) 90%), linear-gradient(rgba(15,20,25,0.25), rgba(15,20,25,0.45)), url(${url})`,
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
  }, [cityById, project, viewType, travelUnlock]);

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

  function resetTravelSelection(keepSelectedCity = true) {
    setTravelFromId(null);
    setTravelToId(null);
    setPlannerPlans([]);
    if (!keepSelectedCity) {
      setSelectedCityId(null);
    }
  }

  function resetRun() {
    setResources(INITIAL_RESOURCES);
    setSessionVictory(false);
    setHqLevel(1);
    setActiveTrips([]);
    setPendingEvent(null);
    setTravelFromId(null);
    setTravelToId(null);
    setPlannerPlans([]);
    setSelectedCityId(null);
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
  }

  function switchView(next: MapViewType) {
    if (next === viewType) return;
    setViewType(next);
    resetTravelSelection(false);
  }

  function bookPlan(plan: TripPlan) {
    if (!travelFrom || !travelTo) return;
    if (!travelFrom.unlocked || !travelTo.unlocked) {
      appendLog(t.cityLockedTrip);
      return;
    }
    if (resources.coin < plan.totalPrice) {
      appendLog(formatStr(t.logInsufficientCoin, {need: plan.totalPrice, have: resources.coin}));
      return;
    }
    if (resources.fuel < plan.fuelCost) {
      appendLog(formatStr(t.logInsufficientFuel, {need: plan.fuelCost, have: resources.fuel}));
      return;
    }
    const clueBonus = plan.planStyle === 'CHEAP' ? 1 : 0;
    setResources((current) => ({
      ...current,
      coin: current.coin - plan.totalPrice,
      fuel: Math.max(0, current.fuel - plan.fuelCost),
      clue: current.clue + clueBonus,
    }));
    const trip: ActiveTrip = {
      id: nextTripId.current,
      from: travelFrom,
      to: travelTo,
      plan,
      elapsedTurn: 0,
      delayTurn: 0,
      status: 'IN_TRANSIT',
    };
    nextTripId.current += 1;
    setActiveTrips((current) => [trip, ...current]);
    appendLog(
      formatStr(t.logBookTrip, {
        id: trip.id,
        from: cityLabel(travelFrom),
        to: cityLabel(travelTo),
        price: plan.totalPrice,
      }),
    );
    resetTravelSelection();
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

      setActiveTrips((current) => {
        const nextTrips: ActiveTrip[] = [];
        for (const trip of current) {
          let nextTrip = {...trip};
          if (nextTrip.status === 'PAUSED') {
            nextTrips.push(nextTrip);
            continue;
          }

          nextTrip.elapsedTurn += 1;
          if (Math.random() < 0.6) {
            const event = pickRandomTripEvent();
            nextTrip.lastEventCode = event.code;
            if (event.code !== 'NONE') {
              if (event.interactive && event.choices && !nextPendingEvent) {
                nextTrip.status = 'PAUSED';
                nextPendingEvent = {
                  tripId: nextTrip.id,
                  title: event.title,
                  body: event.body,
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

          if (nextTrip.status !== 'PAUSED' && nextTrip.elapsedTurn >= nextTrip.plan.totalTurn + nextTrip.delayTurn) {
            logsToAppend.push(formatStr(t.logTripArrived, {id: nextTrip.id, city: cityLabel(nextTrip.to)}));
            arrivedTrips.push(nextTrip);
            continue;
          }
          nextTrips.push(nextTrip);
        }
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
    highlightedTripSegments,
    activeTripTokens,
    mapBackdropStyle,
    regionNameByCityId,
    missionRuntimePreview,
    missionStats,
    runResolved,
    nextHqMaterials,
    reloadAll,
    switchView,
    handleCityClick,
    bookPlan,
    advanceTurn,
    upgradeHq,
    upgradeSelectedCity,
    resolveInteractiveChoice,
    resetRun,
    resetTravelSelection,
    setSelectedCityId,
  };
}

export type GameSession = ReturnType<typeof useGameSession>;
