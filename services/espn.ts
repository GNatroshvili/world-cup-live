import { fetchJson } from "./apiClient";
import type {
  EspnAthleteResponse,
  EspnEvent,
  EspnRosterResponse,
  EspnScoreboardResponse,
  EspnStandingsResponse,
  EspnSummary,
  EspnTeamsResponse,
} from "@/types/espn";

const SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const CORE = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world";

const GROUP_RANGE = "20260611-20260627";
const KNOCKOUT_RANGE = "20260628-20260720";

export function fetchEspnStandings(): Promise<EspnStandingsResponse> {
  return fetchJson<EspnStandingsResponse>(`${CORE}/standings`, { revalidate: 30 });
}

export function fetchEspnTeams(): Promise<EspnTeamsResponse> {
  return fetchJson<EspnTeamsResponse>(`${SITE}/teams`, { revalidate: 60 * 60 * 12 });
}

async function fetchRange(dates: string): Promise<EspnEvent[]> {
  const data = await fetchJson<EspnScoreboardResponse>(
    `${SITE}/scoreboard?dates=${dates}`,
    { revalidate: 30 },
  );
  return data.events ?? [];
}

export function fetchEspnSummary(eventId: string): Promise<EspnSummary> {
  return fetchJson<EspnSummary>(`${SITE}/summary?event=${eventId}`, {
    revalidate: 120,
  });
}

export function fetchEspnRoster(teamId: string): Promise<EspnRosterResponse> {
  return fetchJson<EspnRosterResponse>(`${SITE}/teams/${teamId}?enable=roster`, {
    revalidate: 60 * 60 * 12,
  });
}

export function fetchEspnAthlete(athleteId: string): Promise<EspnAthleteResponse> {
  return fetchJson<EspnAthleteResponse>(
    `https://site.web.api.espn.com/apis/common/v3/sports/soccer/fifa.world/athletes/${athleteId}`,
    { revalidate: 60 * 60 * 12 },
  );
}

export async function fetchEspnSchedule(): Promise<EspnEvent[]> {
  const [group, knockout] = await Promise.all([
    fetchRange(GROUP_RANGE),
    fetchRange(KNOCKOUT_RANGE),
  ]);
  const byId = new Map<string, EspnEvent>();
  for (const ev of [...group, ...knockout]) byId.set(ev.id, ev);
  return [...byId.values()];
}
