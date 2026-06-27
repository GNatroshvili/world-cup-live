"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/uiStore";
import { useT, useI18n } from "@/components/providers/I18nProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { LOCALES, type Locale } from "@/lib/i18n/index";
import styles from "./Header.module.scss";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const t = useT();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={styles.iconBtn}
      onClick={toggle}
      aria-label={isDark ? t.theme.toggleLight : t.theme.toggleDark}
      title={isDark ? t.theme.toggleLight : t.theme.toggleDark}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function LanguageSwitcher() {
  const { locale } = useI18n();
  const t = useT();
  const router = useRouter();
  const switchTo = (next: Locale) => {
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div className={styles.langSwitch}>
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          className={cn(styles.langBtn, locale === loc && styles.langActive)}
          onClick={() => switchTo(loc)}
          aria-pressed={locale === loc}
          lang={loc}
        >
          {t.language[loc]}
        </button>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="World Cup 2026 home">
      <span className={styles.logoMark} aria-hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path
            d="M7 3h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M17 4h2.5a1 1 0 0 1 1 1c0 2-1.4 3.4-3.5 3.6M7 4H4.5a1 1 0 0 0-1 1c0 2 1.4 3.4 3.5 3.6M10 12h4M9 17h6M12 12v3M9 20h6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className={styles.logoText}>
        World Cup <strong>2026</strong>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    mobileNavOpen,
    toggleMobileNav,
    closeMobileNav,
  } = useUIStore();
  const t = useT();
  const [localQuery, setLocalQuery] = useState("");

  const NAV = [
    { href: "/", label: t.nav.home },
    { href: "/matches", label: t.nav.matches },
    { href: "/teams", label: t.nav.teams },
    { href: "/statistics", label: t.nav.statistics },
    { href: "/fantasy", label: t.nav.fantasy },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    router.push(
      `/teams${localQuery ? `?q=${encodeURIComponent(localQuery)}` : ""}`,
    );
    closeMobileNav();
  };

  return (
    <header className={styles.header}>
      <div className={cn("container", styles.inner)}>
        <Logo />

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.link, isActive(item.href) && styles.active)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form className={styles.search} onSubmit={submitSearch} role="search">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            aria-hidden
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m20 20-3-3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder={t.nav.searchPlaceholder}
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            aria-label={t.nav.searchPlaceholder}
          />
        </form>

        <div className={styles.controls}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-label={t.nav.toggleMenu}
          aria-expanded={mobileNavOpen}
          onClick={toggleMobileNav}
        >
          <span
            className={cn(styles.burgerBar, mobileNavOpen && styles.open)}
          />
        </button>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.nav
            className={styles.mobileNav}
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24 }}
          >
            <div className={styles.mobileInner}>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    styles.mobileLink,
                    isActive(item.href) && styles.active,
                  )}
                  onClick={closeMobileNav}
                >
                  {item.label}
                </Link>
              ))}
              <form
                className={styles.mobileSearch}
                onSubmit={submitSearch}
                role="search"
              >
                <input
                  type="search"
                  placeholder={t.nav.searchPlaceholder}
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  aria-label={t.nav.searchPlaceholder}
                />
              </form>
              <div className={styles.mobileControls}>
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <span hidden>{searchQuery}</span>
    </header>
  );
}
