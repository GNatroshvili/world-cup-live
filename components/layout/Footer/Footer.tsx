"use client";

import Link from "next/link";
import { cn } from "@/utils/cn";
import { useT } from "@/components/providers/I18nProvider";
import styles from "./Footer.module.scss";

export function Footer() {
  const t = useT();

  const LINKS = [
    {
      title: t.footer.tournamentTitle,
      items: [
        { href: "/", label: t.footer.groupsAndBracket },
        { href: "/matches", label: t.footer.matchCentre },
        { href: "/statistics", label: t.footer.statistics },
      ],
    },
    {
      title: t.footer.exploreTitle,
      items: [
        { href: "/teams", label: t.footer.allTeams },
        { href: "/#bracket", label: t.footer.knockoutBracket },
        { href: "/matches?status=live", label: t.footer.liveNow },
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={cn("container", styles.inner)}>
        <div className={styles.brand}>
          <span className={styles.mark}>WC</span>
          <div>
            <p className={styles.title}>FIFA World Cup 2026</p>
            <p className={styles.sub}>United 2026 · USA · Canada · Mexico</p>
          </div>
        </div>

        {LINKS.map((col) => (
          <nav key={col.title} className={styles.col} aria-label={col.title}>
            <p className={styles.colTitle}>{col.title}</p>
            {col.items.map((item) => (
              <Link key={item.label} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ))}
          </nav>
        ))}

        <div className={styles.col}>
          <p className={styles.colTitle}>{t.footer.dataTitle}</p>
          <p className={styles.attrib}>
            {t.footer.dataAttrib1}{" "}
            <a
              href="https://www.espn.com/soccer/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              ESPN
            </a>
            {t.footer.dataAttrib2}{" "}
            <a
              href="https://www.thesportsdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              TheSportsDB
            </a>
            .
          </p>
        </div>
      </div>

      <div className={cn("container", styles.bottom)}>
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
