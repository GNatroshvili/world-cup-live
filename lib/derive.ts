// Pure functions that DERIVE standings and statistics from match data.
// No tournament results are hardcoded here — everything is computed from the
// finished matches passed in (which carry real scores fetched from the API).

import type {
  Match,
  MatchResult,
  Standing,
  StatLeader,
  TeamRef,
  TournamentStatistics,
} from "@/types";

interface Tally {
  team: TeamRef;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  /** chronological results for form */
  results: { at: number; r: MatchResult }[];
}

function emptyTally(team: TeamRef): Tally {
  return {
    team,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    results: [],
  };
}

const isCounted = (m: Match) =>
  m.status === "finished" && m.homeScore != null && m.awayScore != null;

const kickoffMs = (m: Match) => (m.kickoff ? new Date(m.kickoff).getTime() : 0);

function applyMatch(tally: Map<string, Tally>, m: Match) {
  if (!isCounted(m) || !m.home || !m.away) return;
  const hs = m.homeScore as number;
  const as = m.awayScore as number;
  const home = tally.get(m.home.id);
  const away = tally.get(m.away.id);
  if (!home || !away) return;
  const at = kickoffMs(m);

  home.played++;
  away.played++;
  home.goalsFor += hs;
  home.goalsAgainst += as;
  away.goalsFor += as;
  away.goalsAgainst += hs;
  if (as === 0) home.cleanSheets++;
  if (hs === 0) away.cleanSheets++;

  if (hs > as) {
    home.win++;
    away.loss++;
    home.results.push({ at, r: "W" });
    away.results.push({ at, r: "L" });
  } else if (hs < as) {
    away.win++;
    home.loss++;
    home.results.push({ at, r: "L" });
    away.results.push({ at, r: "W" });
  } else {
    home.draw++;
    away.draw++;
    home.results.push({ at, r: "D" });
    away.results.push({ at, r: "D" });
  }
}

function points(t: Tally) {
  return t.win * 3 + t.draw;
}

function form(t: Tally): MatchResult[] {
  return [...t.results]
    .sort((a, b) => b.at - a.at)
    .slice(0, 5)
    .map((x) => x.r);
}

/** Standings for a set of teams, computed from their finished matches. */
export function computeStandings(teams: TeamRef[], matches: Match[]): Standing[] {
  const tally = new Map<string, Tally>();
  teams.forEach((t) => tally.set(t.id, emptyTally(t)));
  matches.forEach((m) => applyMatch(tally, m));

  return [...tally.values()]
    .map((t) => ({
      team: t.team,
      played: t.played,
      win: t.win,
      draw: t.draw,
      loss: t.loss,
      goalsFor: t.goalsFor,
      goalsAgainst: t.goalsAgainst,
      goalDifference: t.goalsFor - t.goalsAgainst,
      points: points(t),
      form: form(t),
      position: 0,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.team.name.localeCompare(b.team.name),
    )
    .map((s, i) => ({ ...s, position: i + 1 }));
}

function leaderboard(
  tally: Tally[],
  value: (t: Tally) => number,
  detail?: (t: Tally) => string,
  limit = 5,
): StatLeader[] {
  return tally
    .filter((t) => value(t) > 0)
    .sort((a, b) => value(b) - value(a) || a.team.name.localeCompare(b.team.name))
    .slice(0, limit)
    .map((t) => ({
      team: t.team,
      value: value(t),
      detail: detail?.(t),
    }));
}

/** Tournament-wide statistics, computed from all finished matches. */
export function buildStatistics(
  teams: TeamRef[],
  matches: Match[],
): TournamentStatistics {
  const tally = new Map<string, Tally>();
  teams.forEach((t) => tally.set(t.id, emptyTally(t)));
  matches.forEach((m) => applyMatch(tally, m));
  const tallies = [...tally.values()];

  const played = matches.filter(isCounted);
  const goals = played.reduce(
    (sum, m) => sum + (m.homeScore as number) + (m.awayScore as number),
    0,
  );

  const highestScoringMatches = [...played]
    .sort(
      (a, b) =>
        (b.homeScore! + b.awayScore!) - (a.homeScore! + a.awayScore!) ||
        kickoffMs(b) - kickoffMs(a),
    )
    .slice(0, 6);

  return {
    totals: {
      teams: teams.length,
      matchesPlayed: played.length,
      matchesScheduled: matches.length,
      goals,
      averageGoalsPerMatch: played.length
        ? Math.round((goals / played.length) * 100) / 100
        : 0,
      cleanSheets: tallies.reduce((s, t) => s + t.cleanSheets, 0),
    },
    mostWins: leaderboard(tallies, (t) => t.win, (t) => `${t.played} played`),
    mostGoals: leaderboard(tallies, (t) => t.goalsFor, (t) => `${t.played} played`),
    bestGoalDifference: leaderboard(
      tallies,
      (t) => t.goalsFor - t.goalsAgainst,
      (t) => `${t.goalsFor} for / ${t.goalsAgainst} against`,
    ),
    mostCleanSheets: leaderboard(
      tallies,
      (t) => t.cleanSheets,
      (t) => `${t.played} played`,
    ),
    mostPlayed: leaderboard(tallies, (t) => t.played),
    highestScoringMatches,
  };
}
