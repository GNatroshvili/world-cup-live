import { cache } from "react";
import { fetchEspnAthlete, fetchEspnRoster } from "@/services/espn";
import type { EspnAthleteLite } from "@/types/espn";
import type { Player, PlayerDetail, PositionGroup } from "@/types";

const ORDER: PositionGroup[] = [
  "Goalkeepers",
  "Defenders",
  "Midfielders",
  "Forwards",
  "Squad",
];

function positionGroup(abbrev?: string, name?: string): PositionGroup {
  const a = (abbrev ?? "").toUpperCase();
  const n = (name ?? "").toLowerCase();
  if (a === "G" || n.includes("goalkeeper")) return "Goalkeepers";
  if (a === "D" || n.includes("back") || n.includes("defender")) return "Defenders";
  if (a === "M" || n.includes("midfield")) return "Midfielders";
  if (a === "F" || n.includes("forward") || n.includes("striker") || n.includes("wing"))
    return "Forwards";
  return "Squad";
}

function toPlayer(a: EspnAthleteLite, teamId: string): Player {
  return {
    id: a.id,
    name: a.displayName ?? a.fullName ?? "Unknown",
    jersey: a.jersey ?? null,
    age: a.age ?? null,
    position: a.position?.displayName ?? a.position?.name ?? null,
    positionGroup: positionGroup(
      a.position?.abbreviation,
      a.position?.name ?? a.position?.displayName,
    ),
    headshot: a.headshot?.href ?? null,
    teamId,
  };
}

export const getTeamSquad = cache(async (teamId: string): Promise<Player[]> => {
  try {
    const r = await fetchEspnRoster(teamId);
    const players = (r.team?.athletes ?? []).map((a) => toPlayer(a, teamId));
    return players.sort(
      (x, y) =>
        ORDER.indexOf(x.positionGroup) - ORDER.indexOf(y.positionGroup) ||
        (parseInt(x.jersey ?? "99", 10) || 99) - (parseInt(y.jersey ?? "99", 10) || 99),
    );
  } catch {
    return [];
  }
});

export const getPlayer = cache(async (athleteId: string): Promise<PlayerDetail | null> => {
  try {
    const r = await fetchEspnAthlete(athleteId);
    const a = r.athlete;
    if (!a) return null;
    const t = a.team;
    return {
      ...toPlayer(a, t?.id ?? ""),
      height: a.displayHeight ?? null,
      weight: a.displayWeight ?? null,
      dateOfBirth: a.dateOfBirth ?? null,
      citizenship: a.citizenship ?? null,
      birthPlace: a.birthPlace
        ? [a.birthPlace.city, a.birthPlace.country].filter(Boolean).join(", ")
        : null,
      team: t
        ? {
            id: t.id,
            name: t.displayName,
            shortName: t.abbreviation,
            badge: t.logo ?? t.logos?.[0]?.href ?? null,
          }
        : null,
    };
  } catch {
    return null;
  }
});
