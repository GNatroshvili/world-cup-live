// Raw response shapes from ESPN's public soccer API (subset we consume).
// Endpoints under site.api.espn.com/.../soccer/fifa.world/*.

export interface EspnTeamLite {
  id: string;
  displayName: string;
  shortDisplayName?: string;
  abbreviation: string;
  color?: string;
  logo?: string;
  logos?: { href: string }[];
}

// --- Standings ---------------------------------------------------------------
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
  name: string; // "Group A"
  abbreviation: string;
  standings: { entries: EspnStandingEntry[] };
}

export interface EspnStandingsResponse {
  children: EspnStandingGroup[];
}

// --- Teams -------------------------------------------------------------------
export interface EspnTeamsResponse {
  sports: {
    leagues: {
      teams: { team: EspnTeamLite }[];
    }[];
  }[];
}

// --- Scoreboard / schedule ---------------------------------------------------
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
