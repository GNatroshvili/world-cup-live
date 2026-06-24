import { getTournament } from "@/lib/worldcup";
import { Hero } from "@/features/home/Hero/Hero";
import { HomeBoard } from "@/features/home/HomeBoard/HomeBoard";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { OfflineBanner } from "@/components/ui/OfflineBanner/OfflineBanner";
import { LiveStatus } from "@/components/live/LiveStatus/LiveStatus";
import styles from "./page.module.scss";

// Always render fresh; the API fetch itself is cached for 30s to shield the key.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data, fromFallback } = await getTournament();

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
              eyebrow="Match Centre"
              title="Latest Results"
              description="The most recent fixtures from across the tournament."
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
            eyebrow="Tournament Board"
            title="Groups & Knockout Bracket"
            description="All twelve groups flank the full knockout bracket. Open any group or tie for the full breakdown."
            actions={<LiveStatus updatedAt={data.updatedAt} />}
          />
          <HomeBoard groups={data.groups} bracket={data.bracket} />
        </section>
      </div>
    </>
  );
}
