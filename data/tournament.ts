import type { GroupId } from "@/types";

export interface SeedTeam {
  name: string;
  code: string;
  country: string;
}

export interface Venue {
  stadium: string;
  city: string;
  country: string;
}

export const GROUP_IDS: GroupId[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export const HOST_VENUES: Venue[] = [
  { stadium: "Estadio Azteca", city: "Mexico City", country: "Mexico" },
  { stadium: "Estadio Akron", city: "Guadalajara", country: "Mexico" },
  { stadium: "Estadio BBVA", city: "Monterrey", country: "Mexico" },
  { stadium: "BC Place", city: "Vancouver", country: "Canada" },
  { stadium: "BMO Field", city: "Toronto", country: "Canada" },
  { stadium: "MetLife Stadium", city: "New York / New Jersey", country: "USA" },
  { stadium: "SoFi Stadium", city: "Los Angeles", country: "USA" },
  { stadium: "AT&T Stadium", city: "Dallas", country: "USA" },
  { stadium: "NRG Stadium", city: "Houston", country: "USA" },
  { stadium: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA" },
  { stadium: "Lincoln Financial Field", city: "Philadelphia", country: "USA" },
  { stadium: "Gillette Stadium", city: "Boston", country: "USA" },
  { stadium: "Lumen Field", city: "Seattle", country: "USA" },
  { stadium: "Levi's Stadium", city: "San Francisco Bay Area", country: "USA" },
  { stadium: "Hard Rock Stadium", city: "Miami", country: "USA" },
  { stadium: "Arrowhead Stadium", city: "Kansas City", country: "USA" },
];

export const GROUP_DRAW: Record<GroupId, SeedTeam[]> = {
  A: [
    { name: "Mexico", code: "MEX", country: "Mexico" },
    { name: "South Africa", code: "RSA", country: "South Africa" },
    { name: "South Korea", code: "KOR", country: "South Korea" },
    { name: "Czech Republic", code: "CZE", country: "Czechia" },
  ],
  B: [
    { name: "Canada", code: "CAN", country: "Canada" },
    { name: "Bosnia-Herzegovina", code: "BIH", country: "Bosnia & Herzegovina" },
    { name: "Qatar", code: "QAT", country: "Qatar" },
    { name: "Switzerland", code: "SUI", country: "Switzerland" },
  ],
  C: [
    { name: "Brazil", code: "BRA", country: "Brazil" },
    { name: "Morocco", code: "MAR", country: "Morocco" },
    { name: "Haiti", code: "HAI", country: "Haiti" },
    { name: "Scotland", code: "SCO", country: "Scotland" },
  ],
  D: [
    { name: "USA", code: "USA", country: "United States" },
    { name: "Paraguay", code: "PAR", country: "Paraguay" },
    { name: "Australia", code: "AUS", country: "Australia" },
    { name: "Turkey", code: "TUR", country: "Türkiye" },
  ],
  E: [
    { name: "Germany", code: "GER", country: "Germany" },
    { name: "Curacao", code: "CUW", country: "Curaçao" },
    { name: "Ivory Coast", code: "CIV", country: "Côte d'Ivoire" },
    { name: "Ecuador", code: "ECU", country: "Ecuador" },
  ],
  F: [
    { name: "Netherlands", code: "NED", country: "Netherlands" },
    { name: "Japan", code: "JPN", country: "Japan" },
    { name: "Sweden", code: "SWE", country: "Sweden" },
    { name: "Tunisia", code: "TUN", country: "Tunisia" },
  ],
  G: [
    { name: "Belgium", code: "BEL", country: "Belgium" },
    { name: "Egypt", code: "EGY", country: "Egypt" },
    { name: "Iran", code: "IRN", country: "Iran" },
    { name: "New Zealand", code: "NZL", country: "New Zealand" },
  ],
  H: [
    { name: "Spain", code: "ESP", country: "Spain" },
    { name: "Cape Verde", code: "CPV", country: "Cabo Verde" },
    { name: "Saudi Arabia", code: "KSA", country: "Saudi Arabia" },
    { name: "Uruguay", code: "URU", country: "Uruguay" },
  ],
  I: [
    { name: "France", code: "FRA", country: "France" },
    { name: "Senegal", code: "SEN", country: "Senegal" },
    { name: "Iraq", code: "IRQ", country: "Iraq" },
    { name: "Norway", code: "NOR", country: "Norway" },
  ],
  J: [
    { name: "Argentina", code: "ARG", country: "Argentina" },
    { name: "Algeria", code: "ALG", country: "Algeria" },
    { name: "Austria", code: "AUT", country: "Austria" },
    { name: "Jordan", code: "JOR", country: "Jordan" },
  ],
  K: [
    { name: "Portugal", code: "POR", country: "Portugal" },
    { name: "DR Congo", code: "COD", country: "DR Congo" },
    { name: "Uzbekistan", code: "UZB", country: "Uzbekistan" },
    { name: "Colombia", code: "COL", country: "Colombia" },
  ],
  L: [
    { name: "England", code: "ENG", country: "England" },
    { name: "Croatia", code: "CRO", country: "Croatia" },
    { name: "Ghana", code: "GHA", country: "Ghana" },
    { name: "Panama", code: "PAN", country: "Panama" },
  ],
};

export const GROUP_STAGE_START = "2026-06-11";
export const MATCHDAY_OFFSETS_DAYS = [0, 7, 13];

export interface KnockoutSlotTemplate {
  id: string;
  homeLabel: string;
  awayLabel: string;
  date: string;
  venueIndex: number;
}

export interface KnockoutRoundTemplate {
  stage: "r32" | "r16" | "qf" | "sf" | "third" | "final";
  title: string;
  slots: KnockoutSlotTemplate[];
}

export const KNOCKOUT_TEMPLATE: KnockoutRoundTemplate[] = [
  {
    stage: "r32",
    title: "Round of 32",
    slots: [
      { id: "R32-1", homeLabel: "1A", awayLabel: "2C", date: "2026-06-28", venueIndex: 5 },
      { id: "R32-2", homeLabel: "1C", awayLabel: "2F", date: "2026-06-28", venueIndex: 6 },
      { id: "R32-3", homeLabel: "1E", awayLabel: "2D", date: "2026-06-29", venueIndex: 7 },
      { id: "R32-4", homeLabel: "1B", awayLabel: "2A", date: "2026-06-29", venueIndex: 3 },
      { id: "R32-5", homeLabel: "1G", awayLabel: "2H", date: "2026-06-30", venueIndex: 8 },
      { id: "R32-6", homeLabel: "1I", awayLabel: "2L", date: "2026-06-30", venueIndex: 9 },
      { id: "R32-7", homeLabel: "1F", awayLabel: "2E", date: "2026-07-01", venueIndex: 0 },
      { id: "R32-8", homeLabel: "1D", awayLabel: "2G", date: "2026-07-01", venueIndex: 10 },
      { id: "R32-9", homeLabel: "1H", awayLabel: "2J", date: "2026-07-02", venueIndex: 12 },
      { id: "R32-10", homeLabel: "1L", awayLabel: "2K", date: "2026-07-02", venueIndex: 13 },
      { id: "R32-11", homeLabel: "1J", awayLabel: "2I", date: "2026-07-02", venueIndex: 4 },
      { id: "R32-12", homeLabel: "1K", awayLabel: "2B", date: "2026-07-03", venueIndex: 14 },
      { id: "R32-13", homeLabel: "3rd-1", awayLabel: "3rd-2", date: "2026-07-03", venueIndex: 1 },
      { id: "R32-14", homeLabel: "3rd-3", awayLabel: "3rd-4", date: "2026-07-03", venueIndex: 2 },
      { id: "R32-15", homeLabel: "3rd-5", awayLabel: "3rd-6", date: "2026-07-03", venueIndex: 11 },
      { id: "R32-16", homeLabel: "3rd-7", awayLabel: "3rd-8", date: "2026-07-03", venueIndex: 15 },
    ],
  },
  {
    stage: "r16",
    title: "Round of 16",
    slots: [
      { id: "R16-1", homeLabel: "W R32-1", awayLabel: "W R32-2", date: "2026-07-04", venueIndex: 5 },
      { id: "R16-2", homeLabel: "W R32-3", awayLabel: "W R32-4", date: "2026-07-04", venueIndex: 7 },
      { id: "R16-3", homeLabel: "W R32-5", awayLabel: "W R32-6", date: "2026-07-05", venueIndex: 8 },
      { id: "R16-4", homeLabel: "W R32-7", awayLabel: "W R32-8", date: "2026-07-05", venueIndex: 0 },
      { id: "R16-5", homeLabel: "W R32-9", awayLabel: "W R32-10", date: "2026-07-06", venueIndex: 12 },
      { id: "R16-6", homeLabel: "W R32-11", awayLabel: "W R32-12", date: "2026-07-06", venueIndex: 4 },
      { id: "R16-7", homeLabel: "W R32-13", awayLabel: "W R32-14", date: "2026-07-07", venueIndex: 9 },
      { id: "R16-8", homeLabel: "W R32-15", awayLabel: "W R32-16", date: "2026-07-07", venueIndex: 14 },
    ],
  },
  {
    stage: "qf",
    title: "Quarter Finals",
    slots: [
      { id: "QF-1", homeLabel: "W R16-1", awayLabel: "W R16-2", date: "2026-07-09", venueIndex: 5 },
      { id: "QF-2", homeLabel: "W R16-3", awayLabel: "W R16-4", date: "2026-07-10", venueIndex: 7 },
      { id: "QF-3", homeLabel: "W R16-5", awayLabel: "W R16-6", date: "2026-07-11", venueIndex: 0 },
      { id: "QF-4", homeLabel: "W R16-7", awayLabel: "W R16-8", date: "2026-07-11", venueIndex: 12 },
    ],
  },
  {
    stage: "sf",
    title: "Semi Finals",
    slots: [
      { id: "SF-1", homeLabel: "W QF-1", awayLabel: "W QF-2", date: "2026-07-14", venueIndex: 8 },
      { id: "SF-2", homeLabel: "W QF-3", awayLabel: "W QF-4", date: "2026-07-15", venueIndex: 5 },
    ],
  },
  {
    stage: "third",
    title: "Third Place",
    slots: [
      { id: "TP-1", homeLabel: "L SF-1", awayLabel: "L SF-2", date: "2026-07-18", venueIndex: 9 },
    ],
  },
  {
    stage: "final",
    title: "Final",
    slots: [
      { id: "FIN", homeLabel: "W SF-1", awayLabel: "W SF-2", date: "2026-07-19", venueIndex: 5 },
    ],
  },
];
