// Domain models — normalized, UI-facing shapes derived from the raw API
// and the tournament seed structure.

export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export type KnockoutStage = "r32" | "r16" | "qf" | "sf" | "third" | "final";
export type Stage = "group" | KnockoutStage;

export type MatchResult = "W" | "D" | "L";

/** Lightweight team reference embedded in matches/standings. */
export interface TeamRef {
  id: string;
  name: string;
  shortName: string; // 3-letter code, e.g. "ARG"
  badge: string | null;
}

export interface Team extends TeamRef {
  alternateName: string | null;
  group: GroupId | null;
  country: string | null;
  stadium: string | null;
  location: string | null;
  capacity: number | null;
  formedYear: number | null;
  description: string | null;
  banner: string | null;
  logo: string | null;
  fanart: string[];
  colours: string[];
  website: string | null;
  social: {
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    youtube: string | null;
  };
}

export interface Match {
  id: string;
  stage: Stage;
  /** Display round label, e.g. "Matchday 1", "Round of 16". */
  roundLabel: string;
  group: GroupId | null;
  home: TeamRef | null;
  away: TeamRef | null;
  /** Qualification-path labels for knockout fixtures with undecided teams. */
  homeLabel?: string;
  awayLabel?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  /** ISO 8601 kickoff timestamp (UTC) when known. */
  kickoff: string | null;
  venue: string | null;
  city: string | null;
  league: string;
  leagueBadge: string | null;
  thumb: string | null;
  poster: string | null;
}

export interface Standing {
  team: TeamRef;
  position: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** Most-recent-first results, capped to last 5. */
  form: MatchResult[];
}

export interface Group {
  id: GroupId;
  name: string; // "Group A"
  standings: Standing[];
  matches: Match[];
}

/** A single slot in the knockout bracket. */
export interface BracketMatch {
  id: string;
  stage: KnockoutStage;
  /** Position label used before teams are decided, e.g. "1A", "Winner M73". */
  homeLabel: string;
  awayLabel: string;
  home: TeamRef | null;
  away: TeamRef | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoff: string | null;
  venue: string | null;
  /** id of the underlying Match when this slot maps to a real fixture. */
  matchId: string | null;
}

export interface BracketRound {
  stage: KnockoutStage;
  title: string;
  matches: BracketMatch[];
}

export interface Bracket {
  rounds: BracketRound[];
}

export interface StatLeader {
  team: TeamRef;
  value: number;
  /** Optional secondary metric for display, e.g. "in 3 matches". */
  detail?: string;
}

export interface TournamentStatistics {
  totals: {
    teams: number;
    matchesPlayed: number;
    matchesScheduled: number;
    goals: number;
    averageGoalsPerMatch: number;
    cleanSheets: number;
  };
  mostWins: StatLeader[];
  mostGoals: StatLeader[];
  bestGoalDifference: StatLeader[];
  mostCleanSheets: StatLeader[];
  mostPlayed: StatLeader[];
  highestScoringMatches: Match[];
}

// --- Match detail (from ESPN summary) ---------------------------------------
export type MatchEventType = "goal" | "penalty" | "own" | "yellow" | "red" | "sub";

export interface MatchEventEntry {
  minute: string; // e.g. "21'"
  type: MatchEventType;
  player: string;
  /** Second player (assist for goals, player-in for subs). */
  secondary: string | null;
  /** "home" | "away" relative to the match. */
  side: "home" | "away" | null;
}

export interface TeamMatchStats {
  possession: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  passes: number | null;
  passAccuracy: number | null;
  corners: number | null;
  fouls: number | null;
  offsides: number | null;
  saves: number | null;
  yellowCards: number | null;
}

export interface MatchDetail {
  events: MatchEventEntry[];
  home: TeamMatchStats;
  away: TeamMatchStats;
}

// --- Player / team leaderboards (aggregated) --------------------------------
export interface PlayerStat {
  player: string;
  team: TeamRef | null;
  value: number;
  /** "goals" or "assists" etc. */
  detail?: string;
}

export interface TeamStatRow {
  team: TeamRef;
  played: number;
  goalsFor: number;
  shots: number;
  shotsOnTarget: number;
  possession: number; // average %
  passes: number;
  corners: number;
}

export interface DetailedStats {
  topScorers: PlayerStat[];
  topAssists: PlayerStat[];
  mostShots: StatLeader[];
  mostShotsOnTarget: StatLeader[];
  mostPasses: StatLeader[];
  bestPossession: StatLeader[];
  teamStats: TeamStatRow[];
  /** number of matches that contributed (for empty-state messaging). */
  sampledMatches: number;
}

// --- Players / squad --------------------------------------------------------
export type PositionGroup =
  | "Goalkeepers"
  | "Defenders"
  | "Midfielders"
  | "Forwards"
  | "Squad";

export interface Player {
  id: string;
  name: string;
  jersey: string | null;
  age: number | null;
  position: string | null; // e.g. "Goalkeeper"
  positionGroup: PositionGroup;
  headshot: string | null;
  teamId: string;
}

export interface PlayerDetail extends Player {
  height: string | null;
  weight: string | null;
  dateOfBirth: string | null;
  citizenship: string | null;
  birthPlace: string | null;
  team: TeamRef | null;
}

/** A team's aggregate stats across its played matches (possession etc.). */
export interface TeamSeasonStats {
  matches: number;
  avgPossession: number;
  totalShots: number;
  shotsOnTarget: number;
  totalPasses: number;
  passAccuracy: number;
  corners: number;
  fouls: number;
  /** possession per match for a mini timeline */
  perMatch: { matchId: string; possession: number | null; opponent: string | null }[];
}

export interface WorldCupHonours {
  count: number;
  years: number[];
}

/** The complete, normalized tournament dataset consumed by the app. */
export interface TournamentData {
  teams: Team[];
  teamsById: Record<string, Team>;
  groups: Group[];
  bracket: Bracket;
  matches: Match[];
  statistics: TournamentStatistics;
  /** ISO timestamp of when this dataset was assembled (for "last synced" UI). */
  updatedAt: string;
}

/** Wrapper carrying provenance so the UI can flag fallback/offline state. */
export interface DataResult<T> {
  data: T;
  /** true when the primary source failed and fallback/seed data was used. */
  fromFallback: boolean;
}
