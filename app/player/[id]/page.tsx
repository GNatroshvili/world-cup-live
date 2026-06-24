import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/players";
import { getTournament } from "@/lib/worldcup";
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
  const { id } = await params;
  const { team: teamParam } = await searchParams;
  const player = await getPlayer(id);
  if (!player) notFound();

  // Prefer the NATIONAL team the user navigated from (the athlete payload's
  // own `team` is the player's club, which isn't relevant in a World Cup app).
  let team: TeamRef | null = null;
  if (teamParam) {
    const { data } = await getTournament();
    const t = data.teamsById[teamParam];
    if (t) team = { id: t.id, name: t.name, shortName: t.shortName, badge: t.badge };
  }
  if (!team) team = player.team;

  return (
    <div className={`container ${styles.page}`}>
      <Link href={team ? `/team/${team.id}` : "/teams"} className={styles.back}>
        ← {team ? team.name : "All teams"}
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
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.facts}>
          <Fact label="Position" value={player.position} />
          <Fact label="Shirt Number" value={player.jersey ? `#${player.jersey}` : null} />
          <Fact label="Age" value={player.age} />
          <Fact
            label="Date of Birth"
            value={player.dateOfBirth ? formatLongDate(player.dateOfBirth) : null}
          />
          <Fact label="Height" value={player.height} />
          <Fact label="Weight" value={player.weight} />
          <Fact label="Nationality" value={player.citizenship} />
          <Fact label="Birthplace" value={player.birthPlace} />
        </div>
      </section>
    </div>
  );
}
