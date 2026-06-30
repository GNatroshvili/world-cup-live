export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export type KnockoutStage = "r32" | "r16" | "qf" | "sf" | "third" | "final";
export type Stage = "group" | KnockoutStage;

export type MatchResult = "W" | "D" | "L";

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
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
  roundLabel: string;
  group: GroupId | null;
  home: TeamRef | null;
  away: TeamRef | null;
  homeLabel?: string;
  awayLabel?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
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
  form: MatchResult[];
}

export interface Group {
  id: GroupId;
  name: string;
  standings: Standing[];
  matches: Match[];
}

export interface BracketMatch {
  id: string;
  stage: KnockoutStage;
  homeLabel: string;
  awayLabel: string;
  home: TeamRef | null;
  away: TeamRef | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoff: string | null;
  venue: string | null;
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

export type MatchEventType = "goal" | "penalty" | "own" | "yellow" | "red" | "sub";

export interface MatchEventEntry {
  minute: string;
  type: MatchEventType;
  player: string;
  secondary: string | null;
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

export interface PlayerStat {
  player: string;
  team: TeamRef | null;
  value: number;
  detail?: string;
}

export interface TeamStatRow {
  team: TeamRef;
  played: number;
  goalsFor: number;
  shots: number;
  shotsOnTarget: number;
  possession: number;
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
  sampledMatches: number;
}

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
  position: string | null;
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

export interface TeamSeasonStats {
  matches: number;
  avgPossession: number;
  totalShots: number;
  shotsOnTarget: number;
  totalPasses: number;
  passAccuracy: number;
  corners: number;
  fouls: number;
  perMatch: { matchId: string; possession: number | null; opponent: string | null }[];
}

export interface WorldCupHonours {
  count: number;
  years: number[];
}

export interface TournamentData {
  teams: Team[];
  teamsById: Record<string, Team>;
  groups: Group[];
  bracket: Bracket;
  matches: Match[];
  statistics: TournamentStatistics;
  updatedAt: string;
}

export interface DataResult<T> {
  data: T;
  fromFallback: boolean;
}
