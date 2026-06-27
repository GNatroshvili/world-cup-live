"use client";

import { createContext, useContext } from "react";
import type { Dict } from "@/lib/i18n/en";
import en from "@/lib/i18n/en";
import type { Locale } from "@/lib/i18n/index";

interface I18nContextValue {
  locale: Locale;
  t: Dict;
}

const I18nContext = createContext<I18nContextValue>({ locale: "en", t: en });

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}

interface Props {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}

export function I18nProvider({ locale, dict, children }: Props) {
  return (
    <I18nContext.Provider value={{ locale, t: dict }}>
      {children}
    </I18nContext.Provider>
  );
}
