// ESPN public soccer API — World Cup (fifa.world). Keyless and free.
// Provides full standings (12 groups), all 48 teams, and the complete
// fixture list with live scores. This is the app's primary data source.

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

// Tournament window. ESPN's scoreboard caps each response near 100 events, so
// the group stage and knockout phases are fetched as two ranges and merged.
const GROUP_RANGE = "20260611-20260627";
const KNOCKOUT_RANGE = "20260628-20260720";

/** Full group standings (12 groups, real W/D/L/GF/GA/Pts/rank). */
export function fetchEspnStandings(): Promise<EspnStandingsResponse> {
  return fetchJson<EspnStandingsResponse>(`${CORE}/standings`, { revalidate: 30 });
}

/** All 48 participating teams with crests. */
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

/** Detailed summary for a single match (goal timeline + team statistics). */
export function fetchEspnSummary(eventId: string): Promise<EspnSummary> {
  return fetchJson<EspnSummary>(`${SITE}/summary?event=${eventId}`, {
    revalidate: 120,
  });
}

/** A team's squad (26-player roster). */
export function fetchEspnRoster(teamId: string): Promise<EspnRosterResponse> {
  return fetchJson<EspnRosterResponse>(`${SITE}/teams/${teamId}?enable=roster`, {
    revalidate: 60 * 60 * 12,
  });
}

/** A single player's profile/bio. */
export function fetchEspnAthlete(athleteId: string): Promise<EspnAthleteResponse> {
  return fetchJson<EspnAthleteResponse>(
    `https://site.web.api.espn.com/apis/common/v3/sports/soccer/fifa.world/athletes/${athleteId}`,
    { revalidate: 60 * 60 * 12 },
  );
}

/** The complete fixture list (group stage + knockouts), de-duplicated by id. */
export async function fetchEspnSchedule(): Promise<EspnEvent[]> {
  const [group, knockout] = await Promise.all([
    fetchRange(GROUP_RANGE),
    fetchRange(KNOCKOUT_RANGE),
  ]);
  const byId = new Map<string, EspnEvent>();
  for (const ev of [...group, ...knockout]) byId.set(ev.id, ev);
  return [...byId.values()];
}
