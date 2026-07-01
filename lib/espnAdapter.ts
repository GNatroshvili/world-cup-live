// Builds the full TournamentData from ESPN's public API.
// ESPN provides real standings (12 groups), all 48 teams, and the complete
// fixture list with live scores and the knockout bracket — so everything here
// is real data, with standings/stats taken straight from the source.

import {
  fetchEspnMatchNumbers,
  fetchEspnSchedule,
  fetchEspnStandings,
  fetchEspnTeams,
} from "@/services/espn";
import { buildStatistics } from "@/lib/derive";
import type {
  EspnCompetitor,
  EspnEvent,
  EspnTeamLite,
} from "@/types/espn";
import type {
  Bracket,
  BracketMatch,
  BracketRound,
  Group,
  GroupId,
  KnockoutStage,
  Match,
  MatchResult,
  MatchStatus,
  Stage,
  Standing,
  Team,
  TeamRef,
  TournamentData,
} from "@/types";

// --- small helpers -----------------------------------------------------------
const logoOf = (t: EspnTeamLite): string | null =>
  t.logo ?? t.logos?.[0]?.href ?? null;

const groupLetter = (name: string): GroupId =>
  name.replace(/group/i, "").trim() as GroupId;

const dayOf = (iso: string): string => iso.slice(0, 10);

function parseScore(v: string | undefined): number | null {
  if (v == null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function statusFromEvent(ev: EspnEvent): MatchStatus {
  const s = ev.status.type;
  const d = (s.description ?? "").toLowerCase();
  if (d.includes("postpone") || d.includes("cancel")) return "postponed";
  if (s.state === "post") return "finished";
  if (s.state === "in") return "live";
  return "scheduled";
}

const STAGE_LABEL: Record<KnockoutStage, string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter Finals",
  sf: "Semi Finals",
  third: "Third Place",
  final: "Final",
};

const KNOCKOUT_ORDER: KnockoutStage[] = ["r32", "r16", "qf", "sf", "third", "final"];

/**
 * Vertical card order for each bracket column, by FIFA match number. The bracket
 * view pairs adjacent cards (1st+2nd, 3rd+4th, …) into the match they feed in
 * the next column, so the columns must follow the tree — NOT kickoff order, which
 * scrambles the pairings. This is the fixed FIFA 2026 knockout tree: e.g. the
 * winners of matches 74 & 77 meet in R16 (M89), whose winner meets the winner of
 * M90 (73 & 75) in the quarter-final (M97), and so on up to the final (M104).
 */
const BRACKET_ORDER: Record<KnockoutStage, number[]> = {
  r32: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
  r16: [89, 90, 93, 94, 91, 92, 95, 96],
  qf: [97, 98, 99, 100],
  sf: [101, 102],
  third: [103],
  final: [104],
};

/** Map a knockout fixture date to its round (fallback when counts are partial). */
function knockoutStageFromDate(iso: string): KnockoutStage {
  const d = dayOf(iso);
  if (d <= "2026-07-03") return "r32";
  if (d <= "2026-07-07") return "r16";
  if (d <= "2026-07-12") return "qf";
  if (d === "2026-07-18") return "third";
  if (d >= "2026-07-19") return "final";
  return "sf"; // 14–15 Jul (and any remaining)
}

/**
 * Is this a group-stage match? Date alone is unreliable at the group/knockout
 * boundary: late-night Americas group games kick off after midnight UTC (e.g.
 * Argentina–Jordan at 2026-06-28T02:00Z). A match between two real teams in the
 * SAME group is always a group match.
 */
function isGroupMatch(
  home: TeamRef | null,
  away: TeamRef | null,
  groupByTeamId: Map<string, GroupId>,
  iso: string,
): boolean {
  if (home && away && dayOf(iso) <= "2026-06-28") {
    const gh = groupByTeamId.get(home.id);
    const ga = groupByTeamId.get(away.id);
    if (Boolean(gh) && gh === ga) return true;
  }
  return false;
}

// The fixed knockout bracket shape, in chronological order.
const KNOCKOUT_PLAN: [KnockoutStage, number][] = [
  ["r32", 16],
  ["r16", 8],
  ["qf", 4],
  ["sf", 2],
  ["third", 1],
  ["final", 1],
];

/**
 * Assign each knockout fixture to its round by COUNT over the date-sorted list,
 * not by date thresholds — immune to UTC midnight rollover (a 3 Jul R32 game
 * that kicks off 4 Jul UTC stays in R32). Falls back to date when the full
 * 32-match slate isn't present yet.
 */
function assignKnockoutStages(
  items: { id: string; date: string }[],
): Map<string, KnockoutStage> {
  const out = new Map<string, KnockoutStage>();
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 32) {
    let i = 0;
    for (const [stage, count] of KNOCKOUT_PLAN) {
      for (let k = 0; k < count; k++, i++) out.set(sorted[i].id, stage);
    }
  } else {
    for (const it of sorted) out.set(it.id, knockoutStageFromDate(it.date));
  }
  return out;
}

function matchdayLabel(iso: string): string {
  const d = dayOf(iso);
  if (d <= "2026-06-17") return "Matchday 1";
  if (d <= "2026-06-23") return "Matchday 2";
  return "Matchday 3";
}

function competitorRef(
  c: EspnCompetitor,
  realIds: Set<string>,
): { ref: TeamRef | null; label: string } {
  const t = c.team;
  if (realIds.has(t.id)) {
    return {
      ref: {
        id: t.id,
        name: t.displayName,
        shortName: t.abbreviation,
        badge: logoOf(t),
      },
      label: t.abbreviation,
    };
  }
  // Undetermined knockout slot (e.g. "Group A 2nd Place" / "2A").
  return { ref: null, label: t.abbreviation || t.displayName };
}

/** Most-recent-first W/D/L form per team id, from finished matches. */
function formByTeam(matches: Match[]): Map<string, MatchResult[]> {
  const map = new Map<string, MatchResult[]>();
  const push = (id: string, r: MatchResult) => {
    const arr = map.get(id) ?? [];
    arr.push(r);
    map.set(id, arr);
  };
  const finished = matches
    .filter((m) => m.status === "finished" && m.home && m.away)
    .sort((a, b) => (b.kickoff ?? "").localeCompare(a.kickoff ?? "")); // newest first
  for (const m of finished) {
    const hs = m.homeScore ?? 0;
    const as = m.awayScore ?? 0;
    const [hr, ar]: [MatchResult, MatchResult] =
      hs > as ? ["W", "L"] : hs < as ? ["L", "W"] : ["D", "D"];
    push(m.home!.id, hr);
    push(m.away!.id, ar);
  }
  // cap to last 5
  for (const [id, arr] of map) map.set(id, arr.slice(0, 5));
  return map;
}

export async function buildFromEspn(): Promise<TournamentData> {
  const [standings, teamsRes, events] = await Promise.all([
    fetchEspnStandings(),
    fetchEspnTeams(),
    fetchEspnSchedule(),
  ]);

  // --- team id → group letter (from standings) ------------------------------
  const groupByTeamId = new Map<string, GroupId>();
  for (const g of standings.children) {
    const letter = groupLetter(g.name);
    for (const e of g.standings.entries) groupByTeamId.set(e.team.id, letter);
  }

  // --- teams ----------------------------------------------------------------
  const rawTeams = teamsRes.sports?.[0]?.leagues?.[0]?.teams ?? [];
  const realIds = new Set(rawTeams.map((t) => t.team.id));
  const teams: Team[] = rawTeams.map(({ team: t }) => ({
    id: t.id,
    name: t.displayName,
    shortName: t.abbreviation,
    badge: logoOf(t),
    alternateName: t.shortDisplayName ?? null,
    group: groupByTeamId.get(t.id) ?? null,
    country: t.displayName,
    stadium: null,
    location: null,
    capacity: null,
    formedYear: null,
    description: null,
    banner: null,
    logo: logoOf(t),
    fanart: [],
    colours: t.color ? [`#${t.color}`] : [],
    website: null,
    social: { facebook: null, twitter: null, instagram: null, youtube: null },
  }));
  const teamsById: Record<string, Team> = {};
  for (const t of teams) teamsById[t.id] = t;

  // --- matches (two phases) -------------------------------------------------
  // Phase 1: normalize events and mark each as group or knockout.
  interface Pre {
    ev: EspnEvent;
    home: TeamRef | null;
    away: TeamRef | null;
    homeLabel?: string;
    awayLabel?: string;
    status: MatchStatus;
    homeScore: number | null;
    awayScore: number | null;
    venue: string | null;
    city: string | null;
    isGroup: boolean;
    group: GroupId | null;
  }

  const pre: Pre[] = events
    .map((ev): Pre | null => {
      const comp = ev.competitions?.[0];
      if (!comp) return null;
      const home = comp.competitors.find((c) => c.homeAway === "home");
      const away = comp.competitors.find((c) => c.homeAway === "away");
      if (!home || !away) return null;

      const status = statusFromEvent(ev);
      const played = status === "finished" || status === "live";
      const h = competitorRef(home, realIds);
      const a = competitorRef(away, realIds);
      const group = isGroupMatch(h.ref, a.ref, groupByTeamId, ev.date);
      return {
        ev,
        home: h.ref,
        away: a.ref,
        homeLabel: h.ref ? undefined : h.label,
        awayLabel: a.ref ? undefined : a.label,
        status,
        homeScore: played ? parseScore(home.score) : null,
        awayScore: played ? parseScore(away.score) : null,
        venue: comp.venue?.fullName ?? null,
        city: comp.venue?.address?.city ?? null,
        isGroup: group,
        group: group && h.ref ? groupByTeamId.get(h.ref.id) ?? null : null,
      };
    })
    .filter((p): p is Pre => p !== null);

  // Phase 2: assign knockout rounds by count (UTC-rollover safe).
  const koStage = assignKnockoutStages(
    pre.filter((p) => !p.isGroup).map((p) => ({ id: p.ev.id, date: p.ev.date })),
  );

  const matches: Match[] = pre
    .map((p): Match => {
      const stage: Stage = p.isGroup
        ? "group"
        : koStage.get(p.ev.id) ?? knockoutStageFromDate(p.ev.date);
      return {
        id: p.ev.id,
        stage,
        roundLabel:
          stage === "group" ? matchdayLabel(p.ev.date) : STAGE_LABEL[stage],
        group: p.group,
        home: p.home,
        away: p.away,
        homeLabel: p.homeLabel,
        awayLabel: p.awayLabel,
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        status: p.status,
        kickoff: p.ev.date,
        venue: p.venue,
        city: p.city,
        league: "FIFA World Cup",
        leagueBadge: null,
        thumb: null,
        poster: null,
      };
    })
    .sort((x, y) => (x.kickoff ?? "").localeCompare(y.kickoff ?? ""));

  const form = formByTeam(matches);

  // --- groups + standings (straight from ESPN) ------------------------------
  const stat = (entry: { stats: { name: string; value: number }[] }, name: string) =>
    entry.stats.find((s) => s.name === name)?.value ?? 0;

  const groups: Group[] = standings.children.map((g) => {
    const id = groupLetter(g.name);
    const tableEntries = g.standings.entries.map((e): Standing => {
      const ref: TeamRef = {
        id: e.team.id,
        name: e.team.displayName,
        shortName: e.team.abbreviation,
        badge: logoOf(e.team),
      };
      return {
        team: ref,
        position: stat(e, "rank") || 0,
        played: stat(e, "gamesPlayed"),
        win: stat(e, "wins"),
        draw: stat(e, "ties"),
        loss: stat(e, "losses"),
        goalsFor: stat(e, "pointsFor"),
        goalsAgainst: stat(e, "pointsAgainst"),
        goalDifference: stat(e, "pointDifferential"),
        points: stat(e, "points"),
        form: form.get(e.team.id) ?? [],
      };
    });
    tableEntries.sort(
      (a, b) =>
        (a.position || 99) - (b.position || 99) ||
        b.points - a.points ||
        b.goalDifference - a.goalDifference,
    );
    // Re-number positions if ESPN omitted ranks (pre-tournament).
    tableEntries.forEach((s, i) => {
      if (!s.position) s.position = i + 1;
    });

    return {
      id,
      name: `Group ${id}`,
      standings: tableEntries,
      matches: matches.filter((m) => m.group === id),
    };
  });

  // --- bracket (real teams/labels by stage) ---------------------------------
  // Fetch FIFA match numbers for the knockout matches so we can lay each column
  // out along the tree instead of by kickoff time (which mis-pairs the cards).
  const koMatchIds = matches.filter((m) => m.stage !== "group").map((m) => m.id);
  const matchNumberById = await fetchEspnMatchNumbers(koMatchIds);

  /** Sort key that follows the bracket tree, falling back to kickoff order. */
  const bracketRank = (stage: KnockoutStage, id: string, kickoff: string | null) => {
    const mn = matchNumberById.get(id);
    const i = mn != null ? BRACKET_ORDER[stage].indexOf(mn) : -1;
    // Known slots come first, in tree order; unknown ones keep kickoff order.
    return i >= 0 ? `0:${String(i).padStart(3, "0")}` : `1:${kickoff ?? ""}`;
  };

  const rounds: BracketRound[] = KNOCKOUT_ORDER.map((stage) => {
    const roundMatches = matches
      .filter((m) => m.stage === stage)
      .sort((a, b) =>
        bracketRank(stage, a.id, a.kickoff).localeCompare(
          bracketRank(stage, b.id, b.kickoff),
        ),
      );
    const bracketMatches: BracketMatch[] = roundMatches.map((m) => ({
      id: m.id,
      stage: stage,
      homeLabel: m.homeLabel ?? m.home?.shortName ?? "TBD",
      awayLabel: m.awayLabel ?? m.away?.shortName ?? "TBD",
      home: m.home,
      away: m.away,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      kickoff: m.kickoff,
      venue: m.venue,
      matchId: m.id,
    }));
    return { stage, title: STAGE_LABEL[stage], matches: bracketMatches };
  }).filter((r) => r.matches.length > 0);

  const bracket: Bracket = { rounds };

  // --- statistics -----------------------------------------------------------
  const teamRefs: TeamRef[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    badge: t.badge,
  }));
  const statistics = buildStatistics(teamRefs, matches);
  statistics.totals.teams = teams.length;
  statistics.totals.matchesScheduled = matches.length;

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
