import type {CityVO} from '../api/types';
import type {Agent} from '../game/agents';
import type {MissionState} from '../game/missions';
import type {PassportState} from '../game/passport';
import type {WeatherState} from '../game/weather';
import type {ActiveTrip} from '../game/travel';

const STORAGE_KEY = 'map-game-session-v1';

export interface PersistedSession {
  resources: {coin: number; clue: number; star: number; fuel: number; turn: number};
  agents: Agent[];
  passport: PassportState;
  activeTrips: ActiveTrip[];
  missions: MissionState[];
  logs: string[];
  hqLevel: number;
  cityLevels: Record<number, number>;
  weather: WeatherState;
  travelNews: string[];
  nextTripId: number;
  nextMissionId: number;
  sessionVictory: boolean;
}

export function loadPersistedSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export function savePersistedSession(data: PersistedSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function clearPersistedSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function reviveActiveTrips(trips: ActiveTrip[], cityById: Map<number, CityVO>): ActiveTrip[] {
  return trips
    .map((trip) => {
      const from = cityById.get(trip.from.id) ?? trip.from;
      const to = cityById.get(trip.to.id) ?? trip.to;
      return {...trip, from, to};
    })
    .filter((trip) => trip.from && trip.to);
}
