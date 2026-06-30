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

export function translateRound(label: string, t: Dict): string {
  const md = label.match(/^Matchday (\d+)$/);
  if (md) return `${t.knockoutRounds.matchday} ${md[1]}`;
  const key = ROUND_TO_KEY[label];
  return key ? t.knockoutRounds[key] : label;
}

export function translateVenue(
  name: string | null | undefined,
  t: Dict,
): string | null | undefined {
  if (!name) return name;
  return (t.venueNames as Record<string, string>)[name] ?? name;
}

export function translateCity(
  name: string | null | undefined,
  t: Dict,
): string | null | undefined {
  if (!name) return name;
  return (t.cityNames as Record<string, string>)[name] ?? name;
}

export function translateCountry(
  name: string | null | undefined,
  t: Dict,
): string | null | undefined {
  if (!name) return name;
  return (t.countryNames as Record<string, string>)[name] ?? name;
}

export function translateShortName(
  code: string | null | undefined,
  t: Dict,
): string {
  if (!code) return code ?? "";
  return (
    (t.shortCountryNames as Record<string, string>)[code.toUpperCase()] ?? code
  );
}
