import { fetchEspnSummary } from "@/services/espn";
import type { EspnKeyEvent, EspnSummary } from "@/types/espn";
import type {
  DetailedStats,
  Match,
  MatchDetail,
  MatchEventEntry,
  MatchEventType,
  PlayerStat,
  StatLeader,
  Team,
  TeamMatchStats,
  TeamRef,
  TeamSeasonStats,
  TeamStatRow,
} from "@/types";

function num(v: string | number | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

function stat(
  stats: { name: string; displayValue: string; value?: number }[] | undefined,
  name: string,
): number | null {
  const s = stats?.find((x) => x.name === name);
  if (!s) return null;
  return num(s.value ?? s.displayValue);
}

function classifyEvent(e: EspnKeyEvent): MatchEventType | null {
  if (e.scoringPlay) {
    const t = (e.type?.text ?? "").toLowerCase();
    if (t.includes("own")) return "own";
    if (t.includes("penalty")) return "penalty";
    return "goal";
  }
  switch (e.type?.text) {
    case "Yellow Card":
      return "yellow";
    case "Red Card":
      return "red";
    case "Substitution":
      return "sub";
    default:
      return null;
  }
}

const isGoalType = (t: MatchEventType) => t === "goal" || t === "penalty" || t === "own";

function minuteKey(clock: string | undefined): number {
  if (!clock) return 0;
  const base = parseInt(clock, 10) || 0;
  const plus = clock.includes("+") ? parseInt(clock.split("+")[1], 10) || 0 : 0;
  return base * 100 + plus;
}

function homeAwayIds(summary: EspnSummary): { homeId?: string; awayId?: string } {
  const competitors = summary.header?.competitions?.[0]?.competitors ?? [];
  return {
    homeId: competitors.find((c) => c.homeAway === "home")?.team?.id,
    awayId: competitors.find((c) => c.homeAway === "away")?.team?.id,
  };
}

function teamStatsFrom(
  stats: { name: string; displayValue: string; value?: number }[] | undefined,
): TeamMatchStats {
  const passPct = stat(stats, "passPct");
  return {
    possession: stat(stats, "possessionPct"),
    shots: stat(stats, "totalShots"),
    shotsOnTarget: stat(stats, "shotsOnTarget"),
    passes: stat(stats, "totalPasses"),
    passAccuracy: passPct == null ? null : Math.round((passPct <= 1 ? passPct * 100 : passPct)),
    corners: stat(stats, "wonCorners"),
    fouls: stat(stats, "foulsCommitted"),
    offsides: stat(stats, "offsides"),
    saves: stat(stats, "saves"),
    yellowCards: stat(stats, "yellowCards"),
  };
}

export function parseMatchSummary(summary: EspnSummary): MatchDetail {
  const { homeId, awayId } = homeAwayIds(summary);

  const events: MatchEventEntry[] = (summary.keyEvents ?? [])
    .map((e: EspnKeyEvent): MatchEventEntry | null => {
      const type = classifyEvent(e);
      if (!type) return null;
      const player = e.participants?.[0]?.athlete?.displayName;
      if (!player) return null;
      const side =
        e.team?.id === homeId ? "home" : e.team?.id === awayId ? "away" : null;
      return {
        minute: e.clock?.displayValue ?? "",
        type,
        player,
        secondary: e.participants?.[1]?.athlete?.displayName ?? null,
        side,
      };
    })
    .filter((e): e is MatchEventEntry => e !== null)
    .sort((a, b) => minuteKey(a.minute) - minuteKey(b.minute));

  const boxTeams = summary.boxscore?.teams ?? [];
  const homeBox = boxTeams.find((t) => t.team?.id === homeId) ?? boxTeams[0];
  const awayBox = boxTeams.find((t) => t.team?.id === awayId) ?? boxTeams[1];

  return {
    events,
    home: teamStatsFrom(homeBox?.statistics),
    away: teamStatsFrom(awayBox?.statistics),
  };
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function buildTeamSeasonStats(
  teamId: string,
  matches: Match[],
): Promise<TeamSeasonStats> {
  const summaries = await mapLimit(matches, 4, async (m) => {
    try {
      return { m, s: await fetchEspnSummary(m.id) };
    } catch {
      return null;
    }
  });

  let possSum = 0;
  let possCount = 0;
  let paSum = 0;
  let paCount = 0;
  let matchesParsed = 0;
  let totalShots = 0;
  let shotsOnTarget = 0;
  let totalPasses = 0;
  let corners = 0;
  let fouls = 0;
  const perMatch: TeamSeasonStats["perMatch"] = [];

  for (const entry of summaries) {
    if (!entry) continue;
    const bt = (entry.s.boxscore?.teams ?? []).find((t) => t.team?.id === teamId);
    if (!bt) continue;
    matchesParsed++;
    const st = teamStatsFrom(bt.statistics);
    if (st.possession != null) {
      possSum += st.possession;
      possCount++;
    }
    if (st.passAccuracy != null) {
      paSum += st.passAccuracy;
      paCount++;
    }
    totalShots += st.shots ?? 0;
    shotsOnTarget += st.shotsOnTarget ?? 0;
    totalPasses += st.passes ?? 0;
    corners += st.corners ?? 0;
    fouls += st.fouls ?? 0;
    const opp = entry.m.home?.id === teamId ? entry.m.away : entry.m.home;
    perMatch.push({
      matchId: entry.m.id,
      possession: st.possession,
      opponent: opp?.shortName ?? null,
    });
  }

  return {
    matches: matchesParsed,
    avgPossession: possCount ? Math.round((possSum / possCount) * 10) / 10 : 0,
    totalShots,
    shotsOnTarget,
    totalPasses,
    passAccuracy: paCount ? Math.round(paSum / paCount) : 0,
    corners,
    fouls,
    perMatch,
  };
}

interface ScorerAcc {
  player: string;
  teamId: string;
  value: number;
}
interface TeamAcc {
  played: number;
  goalsFor: number;
  shots: number;
  shotsOnTarget: number;
  possessionSum: number;
  possessionCount: number;
  passes: number;
  corners: number;
}

export async function aggregateDetailedStats(
  finished: Match[],
  teamsById: Record<string, Team>,
): Promise<DetailedStats> {
  const refOf = (id: string | undefined): TeamRef | null => {
    if (!id) return null;
    const t = teamsById[id];
    return t ? { id: t.id, name: t.name, shortName: t.shortName, badge: t.badge } : null;
  };

  const summaries = await mapLimit(finished, 6, async (m) => {
    try {
      return { match: m, summary: await fetchEspnSummary(m.id) };
    } catch {
      return null;
    }
  });

  const scorers = new Map<string, ScorerAcc>();
  const assists = new Map<string, ScorerAcc>();
  const teamAcc = new Map<string, TeamAcc>();
  let sampledMatches = 0;

  const bump = (
    map: Map<string, ScorerAcc>,
    player: string,
    teamId: string,
  ) => {
    const key = `${player}__${teamId}`;
    const cur = map.get(key) ?? { player, teamId, value: 0 };
    cur.value += 1;
    map.set(key, cur);
  };

  for (const entry of summaries) {
    if (!entry) continue;
    sampledMatches++;
    const { summary } = entry;

    for (const e of summary.keyEvents ?? []) {
      const type = classifyEvent(e);
      if (!type || !isGoalType(type)) continue;
      const teamId = e.team?.id ?? "";
      const scorer = e.participants?.[0]?.athlete?.displayName;
      if (scorer && type !== "own" && teamId) bump(scorers, scorer, teamId);
      const assister = e.participants?.[1]?.athlete?.displayName;
      if (assister && type === "goal" && teamId) bump(assists, assister, teamId);
    }

    const { homeId, awayId } = homeAwayIds(summary);
    for (const bt of summary.boxscore?.teams ?? []) {
      const id = bt.team?.id;
      if (!id) continue;
      const s = teamStatsFrom(bt.statistics);
      const acc =
        teamAcc.get(id) ??
        {
          played: 0,
          goalsFor: 0,
          shots: 0,
          shotsOnTarget: 0,
          possessionSum: 0,
          possessionCount: 0,
          passes: 0,
          corners: 0,
        };
      acc.played += 1;
      acc.shots += s.shots ?? 0;
      acc.shotsOnTarget += s.shotsOnTarget ?? 0;
      acc.passes += s.passes ?? 0;
      acc.corners += s.corners ?? 0;
      if (s.possession != null) {
        acc.possessionSum += s.possession;
        acc.possessionCount += 1;
      }
      const m = entry.match;
      if (id === homeId) acc.goalsFor += m.homeScore ?? 0;
      else if (id === awayId) acc.goalsFor += m.awayScore ?? 0;
      teamAcc.set(id, acc);
    }
  }

  const toPlayerStats = (map: Map<string, ScorerAcc>, detail: string): PlayerStat[] =>
    [...map.values()]
      .sort((a, b) => b.value - a.value || a.player.localeCompare(b.player))
      .slice(0, 12)
      .map((s) => ({ player: s.player, team: refOf(s.teamId), value: s.value, detail }));

  const teamStats: TeamStatRow[] = [...teamAcc.entries()]
    .map(([id, a]): TeamStatRow | null => {
      const team = refOf(id);
      if (!team) return null;
      return {
        team,
        played: a.played,
        goalsFor: a.goalsFor,
        shots: a.shots,
        shotsOnTarget: a.shotsOnTarget,
        possession: a.possessionCount
          ? Math.round((a.possessionSum / a.possessionCount) * 10) / 10
          : 0,
        passes: a.passes,
        corners: a.corners,
      };
    })
    .filter((r): r is TeamStatRow => r !== null)
    .sort((a, b) => b.goalsFor - a.goalsFor || b.shots - a.shots);

  const leaderboard = (
    pick: (r: TeamStatRow) => number,
    detail: (r: TeamStatRow) => string,
  ): StatLeader[] =>
    [...teamStats]
      .filter((r) => pick(r) > 0)
      .sort((a, b) => pick(b) - pick(a))
      .slice(0, 6)
      .map((r) => ({ team: r.team, value: pick(r), detail: detail(r) }));

  return {
    topScorers: toPlayerStats(scorers, "goals"),
    topAssists: toPlayerStats(assists, "assists"),
    mostShots: leaderboard((r) => r.shots, (r) => `${r.played} matches`),
    mostShotsOnTarget: leaderboard((r) => r.shotsOnTarget, (r) => `${r.shots} total`),
    mostPasses: leaderboard((r) => r.passes, (r) => `${r.played} matches`),
    bestPossession: leaderboard(
      (r) => r.possession,
      () => `avg %`,
    ),
    teamStats,
    sampledMatches,
  };
}
