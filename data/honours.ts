// FIFA World Cup winners (historical fact). Used to show "World Cup Titles" on
// team pages; nations with none simply show no honours.
import type { WorldCupHonours } from "@/types";

const TITLES: Record<string, WorldCupHonours> = {
  brazil: { count: 5, years: [1958, 1962, 1970, 1994, 2002] },
  germany: { count: 4, years: [1954, 1974, 1990, 2014] },
  italy: { count: 4, years: [1934, 1938, 1982, 2006] },
  argentina: { count: 3, years: [1978, 1986, 2022] },
  france: { count: 2, years: [1998, 2018] },
  uruguay: { count: 2, years: [1930, 1950] },
  england: { count: 1, years: [1966] },
  spain: { count: 1, years: [2010] },
};

export function worldCupTitles(teamName: string): WorldCupHonours {
  return TITLES[teamName.trim().toLowerCase()] ?? { count: 0, years: [] };
}
