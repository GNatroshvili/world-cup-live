// Raw response shapes from TheSportsDB v1 JSON API.
// Only the fields the app consumes are typed; the API returns many more.
// Every field can be null/"" so consumers must normalize.

export interface SdbTeam {
  idTeam: string;
  strTeam: string;
  strTeamAlternate: string | null;
  strTeamShort: string | null;
  intFormedYear: string | null;
  strLeague: string | null;
  idLeague: string | null;
  strStadium: string | null;
  strLocation: string | null;
  intStadiumCapacity: string | null;
  strWebsite: string | null;
  strFacebook: string | null;
  strTwitter: string | null;
  strInstagram: string | null;
  strYoutube: string | null;
  strDescriptionEN: string | null;
  strColour1: string | null;
  strColour2: string | null;
  strColour3: string | null;
  strCountry: string | null;
  strBadge: string | null;
  strLogo: string | null;
  strBanner: string | null;
  strFanart1: string | null;
  strFanart2: string | null;
  strFanart3: string | null;
  strFanart4: string | null;
  strEquipment: string | null;
}

export interface SdbEvent {
  idEvent: string;
  strEvent: string;
  strSeason: string | null;
  idLeague: string | null;
  strLeague: string | null;
  strLeagueBadge: string | null;
  strHomeTeam: string | null;
  strAwayTeam: string | null;
  idHomeTeam: string | null;
  idAwayTeam: string | null;
  intRound: string | null;
  strGroup: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strTimestamp: string | null;
  dateEvent: string | null;
  strTime: string | null;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  strVenue: string | null;
  strCountry: string | null;
  strThumb: string | null;
  strPoster: string | null;
  strStatus: string | null;
  strPostponed: string | null;
}

export interface SdbTeamsResponse {
  teams: SdbTeam[] | null;
}

export interface SdbEventsResponse {
  events: SdbEvent[] | null;
}
