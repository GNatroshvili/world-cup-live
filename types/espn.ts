export interface EspnTeamLite {
  id: string;
  displayName: string;
  shortDisplayName?: string;
  abbreviation: string;
  color?: string;
  logo?: string;
  logos?: { href: string }[];
}

export interface EspnStat {
  name: string;
  value: number;
  displayValue: string;
}

export interface EspnStandingEntry {
  team: EspnTeamLite;
  stats: EspnStat[];
}

export interface EspnStandingGroup {
  name: string;
  abbreviation: string;
  standings: { entries: EspnStandingEntry[] };
}

export interface EspnStandingsResponse {
  children: EspnStandingGroup[];
}

export interface EspnTeamsResponse {
  sports: {
    leagues: {
      teams: { team: EspnTeamLite }[];
    }[];
  }[];
}

export interface EspnStatusType {
  state: "pre" | "in" | "post";
  completed: boolean;
  description: string;
  detail?: string;
  shortDetail?: string;
}

export interface EspnCompetitor {
  homeAway: "home" | "away";
  score?: string;
  team: EspnTeamLite;
  winner?: boolean;
}

export interface EspnCompetition {
  date?: string;
  venue?: {
    fullName?: string;
    address?: { city?: string; country?: string };
  };
  notes?: { type?: string; headline?: string }[];
  competitors: EspnCompetitor[];
}

export interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  status: { type: EspnStatusType };
  competitions: EspnCompetition[];
}

export interface EspnScoreboardResponse {
  events: EspnEvent[];
}

export interface EspnKeyEvent {
  type?: { id?: string; text?: string };
  text?: string;
  clock?: { displayValue?: string };
  scoringPlay?: boolean;
  team?: { id?: string; displayName?: string };
  participants?: { athlete?: { id?: string; displayName?: string } }[];
}

export interface EspnBoxscoreTeam {
  team: EspnTeamLite;
  homeAway?: "home" | "away";
  statistics?: { name: string; displayValue: string; value?: number }[];
}

export interface EspnSummary {
  keyEvents?: EspnKeyEvent[];
  boxscore?: { teams?: EspnBoxscoreTeam[] };
  header?: {
    competitions?: {
      competitors?: {
        id?: string;
        homeAway?: "home" | "away";
        team?: EspnTeamLite;
        score?: string;
      }[];
    }[];
  };
}

export interface EspnAthleteLite {
  id: string;
  displayName: string;
  fullName?: string;
  shortName?: string;
  jersey?: string;
  age?: number;
  dateOfBirth?: string;
  displayHeight?: string;
  displayWeight?: string;
  position?: { name?: string; abbreviation?: string; displayName?: string };
  headshot?: { href?: string };
  flag?: { href?: string };
  citizenship?: string;
  birthPlace?: { city?: string; country?: string };
}

export interface EspnRosterResponse {
  team?: { id?: string; displayName?: string; athletes?: EspnAthleteLite[] };
}

export interface EspnAthleteResponse {
  athlete?: EspnAthleteLite & {
    team?: EspnTeamLite;
  };
}
