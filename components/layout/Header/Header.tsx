"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/uiStore";
import styles from "./Header.module.scss";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/teams", label: "Teams" },
  { href: "/statistics", label: "Statistics" },
  { href: "/fantasy", label: "Fantasy" },
];

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
  const { searchQuery, setSearchQuery, mobileNavOpen, toggleMobileNav, closeMobileNav } =
    useUIStore();
  const [localQuery, setLocalQuery] = useState("");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    router.push(`/teams${localQuery ? `?q=${encodeURIComponent(localQuery)}` : ""}`);
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search teams…"
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setSearchQuery(e.target.value);
            }}
            aria-label="Search teams"
          />
        </form>

        <button
          type="button"
          className={styles.burger}
          aria-label="Toggle menu"
          aria-expanded={mobileNavOpen}
          onClick={toggleMobileNav}
        >
          <span className={cn(styles.burgerBar, mobileNavOpen && styles.open)} />
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
                  className={cn(styles.mobileLink, isActive(item.href) && styles.active)}
                  onClick={closeMobileNav}
                >
                  {item.label}
                </Link>
              ))}
              <form className={styles.mobileSearch} onSubmit={submitSearch} role="search">
                <input
                  type="search"
                  placeholder="Search teams…"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  aria-label="Search teams"
                />
              </form>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      {/* keep referenced so store stays in sync across pages */}
      <span hidden>{searchQuery}</span>
    </header>
  );
}
