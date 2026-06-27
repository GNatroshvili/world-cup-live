import { getTournament } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
import { Hero } from "@/features/home/Hero/Hero";
import { HomeBoard } from "@/features/home/HomeBoard/HomeBoard";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { OfflineBanner } from "@/components/ui/OfflineBanner/OfflineBanner";
import { LiveStatus } from "@/components/live/LiveStatus/LiveStatus";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ data, fromFallback }, t] = await Promise.all([
    getTournament(),
    getServerT(),
  ]);

  const latest = data.matches
    .filter((m) => m.status === "finished" || m.status === "live")
    .sort((a, b) => (b.kickoff ?? "").localeCompare(a.kickoff ?? ""))
    .slice(0, 4);

  return (
    <>
      <Hero
        totals={{
          teams: data.statistics.totals.teams,
          matchesPlayed: data.statistics.totals.matchesPlayed,
          goals: data.statistics.totals.goals,
        }}
        t={t.hero}
      />

      <div className="container">
        {fromFallback && (
          <div className={styles.banner}>
            <OfflineBanner />
          </div>
        )}

        {latest.length > 0 && (
          <section className={styles.latest}>
            <SectionHeading
              eyebrow={t.home.latestEyebrow}
              title={t.home.latestTitle}
              description={t.home.latestDesc}
            />
            <div className={styles.latestGrid}>
              {latest.map((m) => (
                <MatchCard key={m.id} match={m} showGroup />
              ))}
            </div>
          </section>
        )}

        <section className={styles.boardSection}>
          <SectionHeading
            eyebrow={t.home.boardEyebrow}
            title={t.home.boardTitle}
            description={t.home.boardDesc}
            actions={<LiveStatus updatedAt={data.updatedAt} />}
          />
          <HomeBoard groups={data.groups} bracket={data.bracket} t={t.home} />
        </section>
      </div>
    </>
  );
}
