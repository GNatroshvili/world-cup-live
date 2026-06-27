import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/players";
import { getTournament } from "@/lib/worldcup";
import { getServerT } from "@/lib/i18n/server";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { teamInitials, formatLongDate } from "@/utils/format";
import type { TeamRef } from "@/types";
import styles from "./player.module.scss";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ team?: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayer(id);
  return {
    title: player?.name ?? "Player",
    description: player
      ? `${player.name}${player.position ? ` · ${player.position}` : ""} — World Cup 2026 profile.`
      : undefined,
  };
}

function Fact({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <div className={styles.fact}>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
    </div>
  );
}

export default async function PlayerPage({ params, searchParams }: Params) {
  const [{ id }, { team: teamParam }, t] = await Promise.all([
    params,
    searchParams,
    getServerT(),
  ]);

  const player = await getPlayer(id);
  if (!player) notFound();

  let team: TeamRef | null = null;
  if (teamParam) {
    const { data } = await getTournament();
    const found = data.teamsById[teamParam];
    if (found) team = { id: found.id, name: found.name, shortName: found.shortName, badge: found.badge };
  }
  if (!team) team = player.team;

  return (
    <div className={`container ${styles.page}`}>
      <Link href={team ? `/team/${team.id}` : "/teams"} className={styles.back}>
        ← {team ? team.name : t.player.allTeams}
      </Link>

      <header className={styles.head}>
        <span className={styles.avatarWrap}>
          {player.headshot ? (
            <Image
              src={player.headshot}
              alt={player.name}
              width={140}
              height={140}
              className={styles.avatar}
              priority
              sizes="140px"
            />
          ) : (
            <span className={styles.fallback}>{teamInitials(player.name)}</span>
          )}
          {player.jersey && <span className={styles.jersey}>{player.jersey}</span>}
        </span>

        <div className={styles.headText}>
          {player.position && <span className={styles.posChip}>{player.position}</span>}
          <h1 className={styles.name}>{player.name}</h1>
          {team && (
            <Link href={`/team/${team.id}`} className={styles.teamChip}>
              <TeamBadge name={team.name} code={team.shortName} badge={team.badge} size="xs" />
              {team.name}
            </Link>
          )}
        </div>
      </header>

      <section className={styles.factsCard}>
        <h2 className={styles.sectionTitle}>{t.player.profile}</h2>
        <div className={styles.facts}>
          <Fact label={t.player.position} value={player.position} />
          <Fact label={t.player.shirtNumber} value={player.jersey ? `#${player.jersey}` : null} />
          <Fact label={t.player.age} value={player.age} />
          <Fact
            label={t.player.dateOfBirth}
            value={player.dateOfBirth ? formatLongDate(player.dateOfBirth) : null}
          />
          <Fact label={t.player.height} value={player.height} />
          <Fact label={t.player.weight} value={player.weight} />
          <Fact label={t.player.nationality} value={player.citizenship} />
          <Fact label={t.player.birthplace} value={player.birthPlace} />
        </div>
      </section>
    </div>
  );
}
