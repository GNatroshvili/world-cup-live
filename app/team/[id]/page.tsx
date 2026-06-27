import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamDetail } from "@/lib/worldcup";
import { getTeamSquad } from "@/lib/players";
import { getServerT } from "@/lib/i18n/server";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { MatchCard } from "@/features/matches/MatchCard/MatchCard";
import { SquadSection } from "@/features/players/SquadSection/SquadSection";
import { TeamSeasonStatsBlock } from "@/features/teams/TeamSeasonStatsBlock/TeamSeasonStatsBlock";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import styles from "./team.module.scss";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const detail = await getTeamDetail(id);
  if (!detail) return { title: "Team not found" };
  const { team } = detail;
  return {
    title: team.name,
    description:
      team.description?.slice(0, 160) ??
      `${team.name} at the FIFA World Cup 2026 — squad info, recent results and upcoming fixtures.`,
  };
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  if (value === null || value === "") return null;
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
    </div>
  );
}

export default async function TeamPage({ params }: Params) {
  const [{ id }, t] = await Promise.all([params, getServerT()]);
  const detail = await getTeamDetail(id);
  if (!detail) notFound();

  const { team, recent, upcoming, honours } = detail;
  const isEspn = /^\d+$/.test(team.id);
  const squad = isEspn ? await getTeamSquad(team.id) : [];

  return (
    <article className={styles.page}>
      <div className={styles.banner}>
        {team.banner || team.fanart[0] ? (
          <Image
            src={(team.banner ?? team.fanart[0]) as string}
            alt={`${team.name} banner`}
            fill
            priority
            className={styles.bannerImg}
            sizes="100vw"
          />
        ) : (
          <div className={styles.bannerFallback} aria-hidden />
        )}
        <div className={styles.bannerFade} />
      </div>

      <div className={`container ${styles.head}`}>
        <TeamBadge
          name={team.name}
          code={team.shortName}
          badge={team.badge}
          size="xl"
        />
        <div className={styles.headText}>
          {team.group && (
            <span className={styles.groupChip}>
              {t.team.groupLabel} {team.group}
            </span>
          )}
          <h1 className={styles.name}>{team.name}</h1>
          <p className={styles.country}>{team.country ?? "International"}</p>
        </div>
        <Link href="/teams" className={styles.back}>
          ← {t.team.backToTeams}
        </Link>
      </div>

      <div className={`container ${styles.body}`}>
        <div className={styles.main}>
          {team.description ? (
            <section className={styles.about}>
              <h2 className={styles.sectionTitle}>{t.team.about}</h2>
              <p className={styles.desc}>{team.description}</p>
            </section>
          ) : null}

          <section>
            <h2 className={styles.sectionTitle}>{t.team.recentResults}</h2>
            {recent.length > 0 ? (
              <div className={styles.matchGrid}>
                {recent.map((m) => (
                  <MatchCard key={m.id} match={m} showGroup />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t.team.noResults}
                description={t.team.campaign}
              />
            )}
          </section>

          <section>
            <h2 className={styles.sectionTitle}>{t.team.fixtures}</h2>
            {upcoming.length > 0 ? (
              <div className={styles.matchGrid}>
                {upcoming.map((m) => (
                  <MatchCard key={m.id} match={m} showGroup />
                ))}
              </div>
            ) : (
              <EmptyState title={t.team.noFixtures} />
            )}
          </section>

          {isEspn && (
            <Suspense
              fallback={
                <Skeleton height="120px" className={styles.blockSkeleton} />
              }
            >
              <TeamSeasonStatsBlock teamId={team.id} />
            </Suspense>
          )}

          {isEspn && (
            <section>
              <h2 className={styles.sectionTitle}>{t.team.squad}</h2>
              <SquadSection squad={squad} />
            </section>
          )}
        </div>

        <aside className={styles.aside}>
          <div className={styles.factsCard}>
            <h2 className={styles.sectionTitle}>{t.team.teamInfo}</h2>
            <Fact label={t.team.country} value={team.country} />
            <Fact
              label={t.teams.group}
              value={team.group ? `${t.team.groupLabel} ${team.group}` : null}
            />
            <Fact label={t.team.stadium} value={team.stadium} />
            <Fact label={t.team.homeCity} value={team.location} />
            <Fact
              label={t.team.capacity}
              value={team.capacity ? team.capacity.toLocaleString() : null}
            />
            <Fact label={t.team.formed} value={team.formedYear} />
            {honours.count > 0 && (
              <div className={styles.fact}>
                <span className={styles.factLabel}>
                  {t.team.worldCupTitles}
                </span>
                <span className={styles.factValue}>
                  <span className={styles.titles}>
                    {"★".repeat(honours.count)} {honours.count}
                  </span>
                </span>
              </div>
            )}
            {team.website && (
              <div className={styles.fact}>
                <span className={styles.factLabel}>{t.team.website}</span>
                <a
                  className={styles.link}
                  href={`https://${team.website.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {team.website}
                </a>
              </div>
            )}
          </div>

          {honours.count > 0 && (
            <div className={styles.honoursCard}>
              <h2 className={styles.sectionTitle}>{t.team.honours}</h2>
              <p className={styles.honoursLead}>
                {honours.count}
                {t.team.worldCupWins}
                {honours.count > 1 ? "s" : ""}
              </p>
              <div className={styles.honoursYears}>
                {honours.years.map((y) => (
                  <span key={y} className={styles.year}>
                    {y}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
