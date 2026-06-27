"use client";

import type { Locale } from "@/lib/i18n/index";
import type { Dict } from "@/lib/i18n/en";
import { I18nProvider } from "./I18nProvider";
import { ThemeProvider } from "./ThemeProvider";

interface Props {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}

export function Providers({ locale, dict, children }: Props) {
  return (
    <ThemeProvider>
      <I18nProvider locale={locale} dict={dict}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
