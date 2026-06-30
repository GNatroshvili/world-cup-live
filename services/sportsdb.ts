import { sdbFetch } from "./apiClient";
import type {
  SdbEventsResponse,
  SdbTeam,
  SdbTeamsResponse,
} from "@/types/thesportsdb";

export const WORLD_CUP_LEAGUE_ID = "4429";
export const WORLD_CUP_LEAGUE_NAME = "FIFA World Cup";
export const TOURNAMENT_SEASON = "2026";

export async function fetchAllTeams(): Promise<SdbTeam[]> {
  const data = await sdbFetch<SdbTeamsResponse>(
    `/search_all_teams.php?l=${encodeURIComponent(WORLD_CUP_LEAGUE_NAME)}`,
    { revalidate: 60 * 60 * 24 },
  );
  return data.teams ?? [];
}

export async function fetchSeasonEvents(
  season: string = TOURNAMENT_SEASON,
): Promise<SdbEventsResponse["events"]> {
  const data = await sdbFetch<SdbEventsResponse>(
    `/eventsseason.php?id=${WORLD_CUP_LEAGUE_ID}&s=${season}`,
    { revalidate: 30 },
  );
  return data.events ?? [];
}

export async function fetchEventById(id: string): Promise<SdbEventsResponse["events"]> {
  const data = await sdbFetch<SdbEventsResponse>(`/lookupevent.php?id=${id}`, {
    revalidate: 30,
  });
  return data.events ?? [];
}

export async function fetchTeamById(id: string): Promise<SdbTeam | null> {
  const data = await sdbFetch<SdbTeamsResponse>(`/lookupteam.php?id=${id}`, {
    revalidate: 60 * 60 * 24,
  });
  return data.teams?.[0] ?? null;
}

export async function fetchTeamByName(name: string): Promise<SdbTeam | null> {
  const data = await sdbFetch<SdbTeamsResponse>(
    `/searchteams.php?t=${encodeURIComponent(name)}`,
    { revalidate: 60 * 60 * 24 },
  );
  const teams = data.teams ?? [];
  return (
    teams.find((t) => (t.strLeague ?? "").toLowerCase().includes("world cup")) ??
    teams[0] ??
    null
  );
}

export async function fetchTeamLastEvents(
  id: string,
): Promise<SdbEventsResponse["events"]> {
  const data = await sdbFetch<SdbEventsResponse>(`/eventslast.php?id=${id}`, {
    revalidate: 60,
  });
  return data.events ?? [];
}
