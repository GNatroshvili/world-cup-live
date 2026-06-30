/**
 * Helpers that translate runtime strings from the data layer (match.roundLabel,
 * match.venue, match.city, team.country) into the active locale using the Dict.
 *
 * All functions fall back to the original string when no translation is found.
 */

import type { Dict } from "./en";

type KnockoutKey = keyof Dict["knockoutRounds"];

const ROUND_TO_KEY: Record<string, KnockoutKey> = {
  "Round of 32": "r32",
  "Round of 16": "r16",
  "Quarter Finals": "qf",
  "Semi Finals": "sf",
  "Third Place": "third",
  Final: "final",
  "Group Stage": "groupStage",
};

/** Translate a match.roundLabel or bracket round title. */
export function translateRound(label: string, t: Dict): string {
  // "Matchday N"
  const md = label.match(/^Matchday (\d+)$/);
  if (md) return `${t.knockoutRounds.matchday} ${md[1]}`;
  const key = ROUND_TO_KEY[label];
  return key ? t.knockoutRounds[key] : label;
}

/** Translate a venue/stadium name. Falls back to original. */
export function translateVenue(
  name: string | null | undefined,
  t: Dict,
): string | null | undefined {
  if (!name) return name;
  return (t.venueNames as Record<string, string>)[name] ?? name;
}

/** Translate a city name. Falls back to original. */
export function translateCity(
  name: string | null | undefined,
  t: Dict,
): string | null | undefined {
  if (!name) return name;
  return (t.cityNames as Record<string, string>)[name] ?? name;
}

/** Translate a country name. Falls back to original. */
export function translateCountry(
  name: string | null | undefined,
  t: Dict,
): string | null | undefined {
  if (!name) return name;
  return (t.countryNames as Record<string, string>)[name] ?? name;
}

/**
 * Translate a team's 3-letter short code (TeamRef.shortName, e.g. "GER")
 * into the active locale's abbreviation. Falls back to the original code.
 */
export function translateShortName(
  code: string | null | undefined,
  t: Dict,
): string {
  if (!code) return code ?? "";
  return (
    (t.shortCountryNames as Record<string, string>)[code.toUpperCase()] ?? code
  );
}
