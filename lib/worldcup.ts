// =============================================================================
// Tournament orchestrator.
//
// Combines the static structure (data/tournament.ts) with LIVE data from
// TheSportsDB:
//   • team metadata (badges, descriptions, banners, stadiums) — from API
//   • real match scores/status                                 — from API
//   • standings & statistics                                   — COMPUTED here
//
// No scores are ever hardcoded. Fixtures without a published result remain
// "scheduled". If the API is unreachable, the app still renders the full
// structure with `fromFallback: true` so the UI can flag offline mode.
// =============================================================================

import { cache } from "react";
import {
  fetchAllTeams,
  fetchSeasonEvents,
  fetchTeamByName,
  WORLD_CUP_LEAGUE_NAME,
} from "@/services/sportsdb";
import { buildStatistics, computeStandings } from "@/lib/derive";
import {
  GROUP_DRAW,
  GROUP_IDS,
  GROUP_STAGE_START,
  HOST_VENUES,
  KNOCKOUT_TEMPLATE,
  MATCHDAY_OFFSETS_DAYS,
} from "@/data/tournament";
import { buildFromEspn } from "@/lib/espnAdapter";
import type { SdbEvent, SdbTeam } from "@/types/thesportsdb";
import type {
  Bracket,
  BracketMatch,
  BracketRound,
  DataResult,
  Group,
  GroupId,
  Match,
  MatchStatus,
  Team,
  TeamRef,
  TournamentData,
  TournamentStatistics,
} from "@/types";

export type { TournamentData };

// --- name normalization for matching API <-> seed -----------------------------
const ALIASES: Record<string, string> = {
  "united states": "usa",
  "korea republic": "south korea",
  "ir iran": "iran",
  "cote divoire": "ivory coast",
  "turkiye": "turkey",
  "congo dr": "dr congo",
  "cabo verde": "cape verde",
};

function normalizeName(input: string | null | undefined): string {
  if (!input) return "";
  let s = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (ALIASES[s]) s = ALIASES[s];
  return s;
}

const pairKey = (a: string, b: string) =>
  [normalizeName(a), normalizeName(b)].sort().join("::");

function parseScore(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function statusFromEvent(ev: SdbEvent): MatchStatus {
  if (ev.strPostponed && ev.strPostponed.toLowerCase() === "yes") return "postponed";
  const s = (ev.strStatus ?? "").toUpperCase();
  if (["FT", "AET", "PEN", "FINISHED", "MATCH FINISHED"].some((x) => s.includes(x)))
    return "finished";
  if (["1H", "2H", "HT", "ET", "LIVE", "PLAYING"].some((x) => s.includes(x)))
    return "live";
  if (parseScore(ev.intHomeScore) != null && parseScore(ev.intAwayScore) != null)
    return "finished";
  return "scheduled";
}

function eventKickoff(ev: SdbEvent): string | null {
  if (ev.strTimestamp) {
    const d = new Date(ev.strTimestamp.endsWith("Z") ? ev.strTimestamp : `${ev.strTimestamp}Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  if (ev.dateEvent) {
    const d = new Date(`${ev.dateEvent}T${ev.strTime ?? "18:00:00"}Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function atTime(dateStr: string, dayOffset: number, hour: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function codeFromName(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, "");
  return letters.slice(0, 3).toUpperCase() || "TBD";
}

// 4-team round-robin schedule (indices into the group's team array).
const ROUND_ROBIN: [number, number][][] = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[0, 3], [1, 2]],
];

function buildTeams(apiTeams: SdbTeam[]): {
  teams: Team[];
  refByCode: Map<string, TeamRef>;
} {
  // Index API teams by every normalized identifier they expose.
  const apiByName = new Map<string, SdbTeam>();
  for (const t of apiTeams) {
    for (const n of [t.strTeam, t.strTeamAlternate]) {
      const key = normalizeName(n);
      if (key && !apiByName.has(key)) apiByName.set(key, t);
    }
  }

  const teams: Team[] = [];
  const refByCode = new Map<string, TeamRef>();

  for (const gid of GROUP_IDS) {
    for (const seed of GROUP_DRAW[gid]) {
      const api = apiByName.get(normalizeName(seed.name));
      const id = api?.idTeam ?? `seed-${seed.code}`;
      const fanart = api
        ? [api.strFanart1, api.strFanart2, api.strFanart3, api.strFanart4].filter(
            (x): x is string => Boolean(x),
          )
        : [];
      const team: Team = {
        id,
        name: seed.name,
        shortName: seed.code,
        badge: api?.strBadge ?? null,
        alternateName: api?.strTeamAlternate ?? null,
        group: gid,
        country: api?.strCountry ?? seed.country,
        stadium: api?.strStadium ?? null,
        location: api?.strLocation ?? null,
        capacity: api?.intStadiumCapacity ? parseInt(api.intStadiumCapacity, 10) : null,
        formedYear: api?.intFormedYear ? parseInt(api.intFormedYear, 10) : null,
        description: api?.strDescriptionEN ?? null,
        banner: api?.strBanner ?? null,
        logo: api?.strLogo ?? null,
        fanart,
        colours: [api?.strColour1, api?.strColour2, api?.strColour3].filter(
          (x): x is string => Boolean(x),
        ),
        website: api?.strWebsite ?? null,
        social: {
          facebook: api?.strFacebook ?? null,
          twitter: api?.strTwitter ?? null,
          instagram: api?.strInstagram ?? null,
          youtube: api?.strYoutube ?? null,
        },
      };
      teams.push(team);
      refByCode.set(seed.code, {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        badge: team.badge,
      });
    }
  }

  return { teams, refByCode };
}

function buildGroupFixtures(
  refByCode: Map<string, TeamRef>,
  eventByPair: Map<string, SdbEvent>,
  overlaidEventIds: Set<string>,
): { matches: Match[]; byGroup: Record<GroupId, Match[]> } {
  const matches: Match[] = [];
  const byGroup = {} as Record<GroupId, Match[]>;

  GROUP_IDS.forEach((gid, gi) => {
    const refs = GROUP_DRAW[gid].map((s) => refByCode.get(s.code)!);
    const groupMatches: Match[] = [];

    ROUND_ROBIN.forEach((round, md) => {
      round.forEach(([h, a], p) => {
        const home = refs[h];
        const away = refs[a];
        const dayOffset = MATCHDAY_OFFSETS_DAYS[md] + Math.floor(gi / 4);
        const kickoff = atTime(GROUP_STAGE_START, dayOffset, 13 + ((gi + p) % 5) * 2);
        const venue = HOST_VENUES[(gi * 2 + md + p) % HOST_VENUES.length];

        const match: Match = {
          id: `G${gid}-MD${md + 1}-${p}`,
          stage: "group",
          roundLabel: `Matchday ${md + 1}`,
          group: gid,
          home,
          away,
          homeScore: null,
          awayScore: null,
          status: "scheduled",
          kickoff,
          venue: venue.stadium,
          city: venue.city,
          league: WORLD_CUP_LEAGUE_NAME,
          leagueBadge: null,
          thumb: null,
          poster: null,
        };

        // Overlay a real result if the API has this exact pairing.
        const ev = eventByPair.get(pairKey(home.name, away.name));
        if (ev) {
          overlaidEventIds.add(ev.idEvent);
          const status = statusFromEvent(ev);
          const directOrder = normalizeName(ev.strHomeTeam) === normalizeName(home.name);
          const evHome = parseScore(ev.intHomeScore);
          const evAway = parseScore(ev.intAwayScore);
          match.id = ev.idEvent;
          match.status = status;
          match.kickoff = eventKickoff(ev) ?? match.kickoff;
          match.venue = ev.strVenue ?? match.venue;
          match.leagueBadge = ev.strLeagueBadge ?? null;
          match.thumb = ev.strThumb ?? null;
          match.poster = ev.strPoster ?? null;
          if (status === "finished" || status === "live") {
            match.homeScore = directOrder ? evHome : evAway;
            match.awayScore = directOrder ? evAway : evHome;
          }
        }

        groupMatches.push(match);
        matches.push(match);
      });
    });

    byGroup[gid] = groupMatches.sort(
      (x, y) => (x.kickoff ?? "").localeCompare(y.kickoff ?? ""),
    );
  });

  return { matches, byGroup };
}

function buildKnockout(): { bracket: Bracket; matches: Match[] } {
  const rounds: BracketRound[] = [];
  const matches: Match[] = [];

  for (const round of KNOCKOUT_TEMPLATE) {
    const bracketMatches: BracketMatch[] = round.slots.map((slot) => {
      const venue = HOST_VENUES[slot.venueIndex];
      const kickoff = atTime(slot.date, 0, 20);
      // Teams are resolved live once the group stage concludes; until then the
      // qualification-path labels are shown.
      const bm: BracketMatch = {
        id: slot.id,
        stage: round.stage,
        homeLabel: slot.homeLabel,
        awayLabel: slot.awayLabel,
        home: null,
        away: null,
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        kickoff,
        venue: venue.stadium,
        matchId: null,
      };
      matches.push({
        id: slot.id,
        stage: round.stage,
        roundLabel: round.title,
        group: null,
        home: null,
        away: null,
        homeLabel: slot.homeLabel,
        awayLabel: slot.awayLabel,
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        kickoff,
        venue: venue.stadium,
        city: venue.city,
        league: WORLD_CUP_LEAGUE_NAME,
        leagueBadge: null,
        thumb: null,
        poster: null,
      });
      return bm;
    });
    rounds.push({ stage: round.stage, title: round.title, matches: bracketMatches });
  }

  return { bracket: { rounds }, matches };
}

function eventToMatch(ev: SdbEvent): Match {
  const status = statusFromEvent(ev);
  const home: TeamRef = {
    id: ev.idHomeTeam ?? `ev-${ev.idEvent}-h`,
    name: ev.strHomeTeam ?? "TBD",
    shortName: codeFromName(ev.strHomeTeam ?? "TBD"),
    badge: ev.strHomeTeamBadge ?? null,
  };
  const away: TeamRef = {
    id: ev.idAwayTeam ?? `ev-${ev.idEvent}-a`,
    name: ev.strAwayTeam ?? "TBD",
    shortName: codeFromName(ev.strAwayTeam ?? "TBD"),
    badge: ev.strAwayTeamBadge ?? null,
  };
  const played = status === "finished" || status === "live";
  return {
    id: ev.idEvent,
    stage: "group",
    roundLabel: ev.intRound ? `Matchday ${ev.intRound}` : "Group Stage",
    group: null,
    home,
    away,
    homeScore: played ? parseScore(ev.intHomeScore) : null,
    awayScore: played ? parseScore(ev.intAwayScore) : null,
    status,
    kickoff: eventKickoff(ev),
    venue: ev.strVenue ?? null,
    city: ev.strCountry ?? null,
    league: ev.strLeague ?? WORLD_CUP_LEAGUE_NAME,
    leagueBadge: ev.strLeagueBadge ?? null,
    thumb: ev.strThumb ?? null,
    poster: ev.strPoster ?? null,
  };
}

function uniqueRefs(matches: Match[]): TeamRef[] {
  const map = new Map<string, TeamRef>();
  for (const m of matches) {
    for (const ref of [m.home, m.away]) {
      if (ref && !map.has(ref.id)) map.set(ref.id, ref);
    }
  }
  return [...map.values()];
}

/**
 * Fallback pipeline: builds the tournament from the static seed draw enriched
 * with TheSportsDB. Used only when the primary ESPN source is unreachable.
 */
async function buildSeedTournament(): Promise<TournamentData> {
    let apiTeams: SdbTeam[] = [];
    let apiEvents: SdbEvent[] = [];

    try {
      const [t, e] = await Promise.all([fetchAllTeams(), fetchSeasonEvents()]);
      apiTeams = t;
      apiEvents = e ?? [];
    } catch {
      // network down — seed structure still renders below
    }

    const { teams, refByCode } = buildTeams(apiTeams);

    const eventByPair = new Map<string, SdbEvent>();
    for (const ev of apiEvents) {
      if (ev.strHomeTeam && ev.strAwayTeam) {
        eventByPair.set(pairKey(ev.strHomeTeam, ev.strAwayTeam), ev);
      }
    }

    const overlaidEventIds = new Set<string>();
    const { matches: groupMatches, byGroup } = buildGroupFixtures(
      refByCode,
      eventByPair,
      overlaidEventIds,
    );
    const { bracket, matches: knockoutMatches } = buildKnockout();

    // Surface any real API results that didn't map onto a group fixture.
    const standaloneReal = apiEvents
      .filter((ev) => !overlaidEventIds.has(ev.idEvent))
      .map(eventToMatch);

    const groups: Group[] = GROUP_IDS.map((gid) => {
      const refs = GROUP_DRAW[gid].map((s) => refByCode.get(s.code)!);
      return {
        id: gid,
        name: `Group ${gid}`,
        standings: computeStandings(refs, byGroup[gid]),
        matches: byGroup[gid],
      };
    });

    const matches = [...groupMatches, ...knockoutMatches, ...standaloneReal].sort(
      (a, b) => (a.kickoff ?? "").localeCompare(b.kickoff ?? ""),
    );

    // Statistics span every team that appears in a counted match (participants
    // plus any extra teams from real standalone results).
    const statsMatches = [...groupMatches, ...standaloneReal];
    const statistics = buildStatistics(uniqueRefs(statsMatches), statsMatches);
    // Headline team count reflects the 48 tournament participants, not the
    // wider set of teams that appear in standalone real results.
    statistics.totals.teams = teams.length;
    // "Fixtures" reflects the full calendar (group + knockout + real extras).
    statistics.totals.matchesScheduled = matches.length;

    const teamsById: Record<string, Team> = {};
    for (const t of teams) teamsById[t.id] = t;

    return {
      teams,
      teamsById,
      groups,
      bracket,
      matches,
      statistics,
      updatedAt: new Date().toISOString(),
    };
}

/**
 * Build the full tournament dataset. Primary source is ESPN's public API
 * (real standings, full schedule, live scores); on failure it falls back to the
 * seed + TheSportsDB pipeline. Memoized per request via React `cache`;
 * cross-request caching is handled by fetch revalidation in the service layer.
 */
export const getTournament = cache(
  async (): Promise<DataResult<TournamentData>> => {
    try {
      const data = await buildFromEspn();
      if (data.teams.length > 0 && data.matches.length > 0) {
        return { data, fromFallback: false };
      }
    } catch {
      // ESPN unreachable — fall back to the seed pipeline below.
    }
    return { data: await buildSeedTournament(), fromFallback: true };
  },
);

// --- page-level selectors -----------------------------------------------------

export async function getGroups(): Promise<DataResult<Group[]>> {
  const { data, fromFallback } = await getTournament();
  return { data: data.groups, fromFallback };
}

export async function getBracket(): Promise<DataResult<Bracket>> {
  const { data, fromFallback } = await getTournament();
  return { data: data.bracket, fromFallback };
}

export async function getMatches(): Promise<DataResult<Match[]>> {
  const { data, fromFallback } = await getTournament();
  return { data: data.matches, fromFallback };
}

export async function getTeams(): Promise<DataResult<Team[]>> {
  const { data, fromFallback } = await getTournament();
  return { data: data.teams, fromFallback };
}

export async function getStatistics(): Promise<DataResult<TournamentStatistics>> {
  const { data, fromFallback } = await getTournament();
  return { data: data.statistics, fromFallback };
}

export interface TeamDetail {
  team: Team;
  recent: Match[];
  upcoming: Match[];
}

export async function getTeamDetail(id: string): Promise<TeamDetail | null> {
  const { data } = await getTournament();
  let team = data.teamsById[id];
  if (!team) return null;

  // Enrich with TheSportsDB metadata (description, banner, stadium) by name,
  // since the primary source (ESPN) doesn't carry long-form team content.
  try {
    const api = await fetchTeamByName(team.name);
    if (api) {
      team = {
        ...team,
        description: team.description ?? api.strDescriptionEN ?? null,
        banner: team.banner ?? api.strBanner ?? null,
        logo: team.logo ?? api.strLogo ?? null,
        fanart: team.fanart.length
          ? team.fanart
          : [api.strFanart1, api.strFanart2, api.strFanart3, api.strFanart4].filter(
              (x): x is string => Boolean(x),
            ),
        stadium: team.stadium ?? api.strStadium ?? null,
        location: team.location ?? api.strLocation ?? null,
        capacity:
          team.capacity ??
          (api.intStadiumCapacity ? parseInt(api.intStadiumCapacity, 10) : null),
        formedYear:
          team.formedYear ??
          (api.intFormedYear ? parseInt(api.intFormedYear, 10) : null),
        website: team.website ?? api.strWebsite ?? null,
      };
    }
  } catch {
    // keep tournament-level data on failure
  }

  const involves = (m: Match) => m.home?.id === id || m.away?.id === id;
  const teamMatches = data.matches.filter(involves);
  const recent = teamMatches
    .filter((m) => m.status === "finished" || m.status === "live")
    .sort((a, b) => (b.kickoff ?? "").localeCompare(a.kickoff ?? ""))
    .slice(0, 6);
  const upcoming = teamMatches
    .filter((m) => m.status === "scheduled" || m.status === "postponed")
    .sort((a, b) => (a.kickoff ?? "").localeCompare(b.kickoff ?? ""))
    .slice(0, 6);

  return { team, recent, upcoming };
}
