"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useFantasyStore } from "@/store/fantasyStore";
import { useT } from "@/components/providers/I18nProvider";
import {
  translateCountry,
  translateRound,
  translateShortName,
} from "@/lib/i18n/translateData";
import {
  KNOCKOUT_POINTS,
  POINTS,
  scoreFantasy,
  type FantasyActuals,
  type PickStatus,
} from "@/lib/fantasyScoring";
import { TeamBadge } from "@/components/ui/TeamBadge/TeamBadge";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { cn } from "@/utils/cn";
import type { GroupId, KnockoutStage, TeamRef } from "@/types";
import styles from "./FantasyGame.module.scss";

interface GroupOption {
  id: GroupId;
  name: string;
  teams: TeamRef[];
}

interface KnockoutFixtureView {
  matchId: string;
  home: TeamRef | null;
  away: TeamRef | null;
  homeLabel: string;
  awayLabel: string;
}

interface KnockoutRoundView {
  stage: KnockoutStage;
  title: string;
  matches: KnockoutFixtureView[];
}

interface Props {
  groups: GroupOption[];
  knockoutRounds: KnockoutRoundView[];
  actuals: FantasyActuals;
}

const STATUS_ICON: Record<PickStatus, string> = {
  correct: "✓",
  wrong: "✗",
  pending: "⏳",
  none: "—",
};

function StatusDot({ status }: { status: PickStatus }) {
  if (status === "none") return null;
  return (
    <span className={cn(styles.statusDot, styles[status])} aria-hidden>
      {STATUS_ICON[status]}
    </span>
  );
}

function KnockoutSide({
  team,
  label,
  selected,
  onSelect,
}: {
  team: TeamRef | null;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      className={cn(
        styles.koSide,
        styles.koPick,
        !team && styles.koSlot,
        selected && styles.koSelected,
      )}
      onClick={onSelect}
      title={team ? translateCountry(team.name, t) ?? team.name : label}
    >
      {team ? (
        <TeamBadge name={team.name} code={team.shortName} badge={team.badge} size="xs" />
      ) : (
        <span className={styles.koSlotDot} aria-hidden />
      )}
      <span className={styles.koLabel}>
        {team ? translateShortName(team.shortName, t) : label}
      </span>
    </button>
  );
}

function KnockoutPick({
  fixture,
  pick,
  status,
  onPick,
}: {
  fixture: KnockoutFixtureView;
  pick: "home" | "away" | undefined;
  status: PickStatus;
  onPick: (side: "home" | "away") => void;
}) {
  return (
    <div className={styles.koMatch}>
      <KnockoutSide
        team={fixture.home}
        label={fixture.homeLabel}
        selected={pick === "home"}
        onSelect={() => onPick("home")}
      />
      <span className={styles.koVs}>
        <StatusDot status={status} />
        {status === "none" && <span className={styles.koVsText}>v</span>}
      </span>
      <KnockoutSide
        team={fixture.away}
        label={fixture.awayLabel}
        selected={pick === "away"}
        onSelect={() => onPick("away")}
      />
    </div>
  );
}

const ROUND_POINTS: Record<KnockoutStage, number> = KNOCKOUT_POINTS;

export function FantasyGame({ groups, knockoutRounds, actuals }: Props) {
  const store = useFantasyStore();
  const t = useT();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useFantasyStore.persist.onFinishHydration(() => setHydrated(true));
    useFantasyStore.persist.rehydrate();
    return unsub;
  }, []);

  const score = useMemo(
    () =>
      scoreFantasy(
        {
          groupWinners: store.groupWinners,
          knockoutWinners: store.knockoutWinners,
        },
        actuals,
      ),
    [store.groupWinners, store.knockoutWinners, actuals],
  );

  const predictedChampion = useMemo(() => {
    const finalFx = knockoutRounds.find((r) => r.stage === "final")?.matches[0];
    if (!finalFx) return null;
    const pick = store.knockoutWinners[finalFx.matchId];
    if (!pick) return null;
    const side = pick === "home" ? finalFx.home : finalFx.away;
    return side ? translateCountry(side.name, t) ?? side.name : t.fantasy.pickChampion;
  }, [knockoutRounds, store.knockoutWinners, t]);

  const knockoutHint = t.fantasy.knockoutHint
    .replace("{r32}", String(ROUND_POINTS.r32))
    .replace("{r16}", String(ROUND_POINTS.r16))
    .replace("{qf}", String(ROUND_POINTS.qf))
    .replace("{sf}", String(ROUND_POINTS.sf))
    .replace("{third}", String(ROUND_POINTS.third))
    .replace("{final}", String(ROUND_POINTS.final));

  if (!hydrated) {
    return (
      <div className={styles.loading}>
        <Skeleton height="120px" />
        <Skeleton height="320px" />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* --- scoreboard --- */}
      <motion.section
        className={styles.scoreboard}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.scoreMain}>
          <span className={styles.scoreValue}>{score.earned}</span>
          <span className={styles.scoreMax}>/ {score.max} {t.fantasy.pts}</span>
        </div>
        <div className={styles.scoreMeta}>
          <div>
            <span className={styles.metaValue}>{score.correctCount}</span>
            <span className={styles.metaLabel}>{t.fantasy.correctPicks}</span>
          </div>
          <div>
            <span className={styles.metaValue}>{score.pending}</span>
            <span className={styles.metaLabel}>{t.fantasy.ptsInPlay}</span>
          </div>
          <label className={styles.nameField}>
            <span className={styles.metaLabel}>{t.fantasy.yourName}</span>
            <input
              type="text"
              placeholder={t.fantasy.namePlaceholder}
              value={store.name}
              maxLength={24}
              onChange={(e) => store.setName(e.target.value)}
            />
          </label>
        </div>
      </motion.section>

      {/* --- group winners --- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{t.fantasy.groupWinners}</h2>
          <p className={styles.sectionHint}>{POINTS.group} {t.fantasy.pts} each</p>
        </div>
        <div className={styles.groups}>
          {groups.map((g) => {
            const pick = store.groupWinners[g.id];
            const actual = actuals.groupWinners[g.id];
            const status = score.groupStatus[g.id];
            return (
              <article key={g.id} className={styles.groupCard}>
                <header className={styles.groupHead}>
                  <span className={styles.groupName}>{t.fantasy.groupLabel} {g.id}</span>
                  <StatusDot status={status} />
                </header>
                <div className={styles.chips}>
                  {g.teams.map((team) => {
                    const selected = pick === team.id;
                    const isActual = actual?.decided && actual.teamId === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        className={cn(
                          styles.chip,
                          selected && styles.chipSelected,
                          isActual && styles.chipActual,
                        )}
                        onClick={() => store.setGroupWinner(g.id, team.id)}
                      >
                        <TeamBadge
                          name={team.name}
                          code={team.shortName}
                          badge={team.badge}
                          size="xs"
                        />
                        <span className={styles.chipName}>
                          {translateCountry(team.name, t) ?? team.name}
                        </span>
                        {isActual && <span className={styles.actualTag}>{t.fantasy.winner}</span>}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* --- knockout / playoff winners --- */}
      {knockoutRounds.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t.fantasy.knockoutSection}</h2>
            <p className={styles.sectionHint}>{knockoutHint}</p>
          </div>
          <div className={styles.koRounds}>
            {knockoutRounds.map((round) => (
              <div
                key={round.stage}
                className={cn(
                  styles.koRound,
                  (round.stage === "final" || round.stage === "third") &&
                    styles.koRoundFeature,
                )}
              >
                <h3 className={styles.koRoundTitle}>{translateRound(round.title, t)}</h3>
                <div className={styles.koList}>
                  {round.matches.map((fx) => (
                    <KnockoutPick
                      key={fx.matchId}
                      fixture={fx}
                      pick={store.knockoutWinners[fx.matchId]}
                      status={score.knockoutStatus[fx.matchId] ?? "none"}
                      onPick={(side) => store.setKnockoutWinner(fx.matchId, side)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- summary / reset --- */}
      <section className={styles.summary}>
        <div className={styles.summaryText}>
          <strong>{store.name ? `${store.name}, ` : ""}</strong>
          {predictedChampion
            ? t.fantasy.backedChampion.replace("{name}", predictedChampion)
            : t.fantasy.pickChampion}{" "}
          {t.fantasy.scoresUpdate}
        </div>
        <Button
          variant="subtle"
          onClick={() => {
            if (window.confirm(t.fantasy.clearConfirm)) store.reset();
          }}
        >
          {t.fantasy.resetBtn}
        </Button>
      </section>
    </div>
  );
}
