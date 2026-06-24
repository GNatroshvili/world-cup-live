import Link from "next/link";
import { cn } from "@/utils/cn";
import styles from "./Footer.module.scss";

const LINKS = [
  {
    title: "Tournament",
    items: [
      { href: "/", label: "Groups & Bracket" },
      { href: "/matches", label: "Match Centre" },
      { href: "/statistics", label: "Statistics" },
    ],
  },
  {
    title: "Explore",
    items: [
      { href: "/teams", label: "All Teams" },
      { href: "/#bracket", label: "Knockout Bracket" },
      { href: "/matches?status=live", label: "Live Now" },
    ],
  },
];

export function Footer() {
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
          <p className={styles.colTitle}>Data</p>
          <p className={styles.attrib}>
            Live scores & standings from{" "}
            <a
              href="https://www.espn.com/soccer/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              ESPN
            </a>
            ; team profiles from{" "}
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
        <p>© 2026 World Cup Live. An unofficial fan project.</p>
        <p>Built with Next.js · Not affiliated with FIFA.</p>
      </div>
    </footer>
  );
}
