import type { Dict } from "./en";

export type Locale = "en" | "ka";
export const LOCALES: Locale[] = ["en", "ka"];
export const DEFAULT_LOCALE: Locale = "en";

export function getLocale(raw: string | undefined | null): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE;
}

const dictionaries: Record<Locale, () => Promise<Dict>> = {
  en: () => import("./en").then((m) => m.default),
  ka: () => import("./ka").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dict> {
  return dictionaries[locale]();
}
