// Typed endpoint functions for TheSportsDB.
// These return RAW API shapes; normalization happens in lib/worldcup.ts.

import { sdbFetch } from "./apiClient";
import type {
  SdbEventsResponse,
  SdbTeam,
  SdbTeamsResponse,
} from "@/types/thesportsdb";

/** TheSportsDB league id for the FIFA World Cup. */
export const WORLD_CUP_LEAGUE_ID = "4429";
export const WORLD_CUP_LEAGUE_NAME = "FIFA World Cup";
export const TOURNAMENT_SEASON = "2026";

/** All teams associated with the World Cup league. */
export async function fetchAllTeams(): Promise<SdbTeam[]> {
  const data = await sdbFetch<SdbTeamsResponse>(
    `/search_all_teams.php?l=${encodeURIComponent(WORLD_CUP_LEAGUE_NAME)}`,
    { revalidate: 60 * 60 * 24 }, // teams change rarely → cache a day
  );
  return data.teams ?? [];
}

/** All events (matches) for a given World Cup season. */
export async function fetchSeasonEvents(
  season: string = TOURNAMENT_SEASON,
): Promise<SdbEventsResponse["events"]> {
  const data = await sdbFetch<SdbEventsResponse>(
    `/eventsseason.php?id=${WORLD_CUP_LEAGUE_ID}&s=${season}`,
    { revalidate: 30 }, // live scores during the tournament — refresh every 30s
  );
  return data.events ?? [];
}

/** A single event by id (used for match detail enrichment). */
export async function fetchEventById(id: string): Promise<SdbEventsResponse["events"]> {
  const data = await sdbFetch<SdbEventsResponse>(`/lookupevent.php?id=${id}`, {
    revalidate: 30,
  });
  return data.events ?? [];
}

/** A single team by id (used for the team detail page). */
export async function fetchTeamById(id: string): Promise<SdbTeam | null> {
  const data = await sdbFetch<SdbTeamsResponse>(`/lookupteam.php?id=${id}`, {
    revalidate: 60 * 60 * 24,
  });
  return data.teams?.[0] ?? null;
}

/**
 * Search a team by name (used to enrich ESPN-sourced teams with descriptions
 * and banners, since the two sources use different id spaces).
 */
export async function fetchTeamByName(name: string): Promise<SdbTeam | null> {
  const data = await sdbFetch<SdbTeamsResponse>(
    `/searchteams.php?t=${encodeURIComponent(name)}`,
    { revalidate: 60 * 60 * 24 },
  );
  const teams = data.teams ?? [];
  // Prefer a soccer national team result.
  return (
    teams.find((t) => (t.strLeague ?? "").toLowerCase().includes("world cup")) ??
    teams[0] ??
    null
  );
}

/** Last N events for a team (recent matches on team page). */
export async function fetchTeamLastEvents(
  id: string,
): Promise<SdbEventsResponse["events"]> {
  const data = await sdbFetch<SdbEventsResponse>(`/eventslast.php?id=${id}`, {
    revalidate: 60,
  });
  return data.events ?? [];
}
