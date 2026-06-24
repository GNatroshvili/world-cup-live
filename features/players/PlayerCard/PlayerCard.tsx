import Link from "next/link";
import Image from "next/image";
import { teamInitials } from "@/utils/format";
import type { Player } from "@/types";
import styles from "./PlayerCard.module.scss";

interface Props {
  player: Player;
}

export function PlayerCard({ player }: Props) {
  return (
    <Link
      href={`/player/${player.id}?team=${player.teamId}`}
      className={styles.card}
    >
      <span className={styles.avatarWrap}>
        {player.headshot ? (
          <Image
            src={player.headshot}
            alt={player.name}
            width={64}
            height={64}
            className={styles.avatar}
            sizes="64px"
          />
        ) : (
          <span className={styles.fallback}>{teamInitials(player.name)}</span>
        )}
        {player.jersey && <span className={styles.jersey}>{player.jersey}</span>}
      </span>
      <span className={styles.name}>{player.name}</span>
      <span className={styles.position}>{player.position ?? "—"}</span>
    </Link>
  );
}
