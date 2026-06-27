"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MatchCard } from "../MatchCard/MatchCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { cn } from "@/utils/cn";
import { useT } from "@/components/providers/I18nProvider";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import type { GroupId, Match, MatchStatus } from "@/types";
import styles from "./MatchesExplorer.module.scss";

type StatusFilter = "all" | "live" | "upcoming" | "finished";
type SortOrder = "newest" | "oldest";

interface Props {
  matches: Match[];
  groups: GroupId[];
  initialStatus?: StatusFilter;
}

function matchesStatus(m: Match, f: StatusFilter): boolean {
  if (f === "all") return true;
  if (f === "live") return m.status === "live";
  if (f === "upcoming") return m.status === "scheduled" || m.status === "postponed";
  return m.status === "finished";
}

export function MatchesExplorer({ matches, groups, initialStatus = "all" }: Props) {
  const t = useT();

  // Filter + sort state is persisted in sessionStorage so returning to this
  // page within the same browser session restores where the user left off.
  const [status, setStatus] = useSessionStorage<StatusFilter>("matches:status", initialStatus);
  const [group, setGroup] = useSessionStorage<GroupId | "all">("matches:group", "all");
  const [sort, setSort] = useSessionStorage<SortOrder>("matches:sort", "newest");

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t.matches.all },
    { key: "live", label: t.matches.live },
    { key: "upcoming", label: t.matches.upcoming },
    { key: "finished", label: t.matches.completed },
  ];

  const filtered = useMemo(() => {
    const result = matches
      .filter((m) => matchesStatus(m, status))
      .filter((m) => (group === "all" ? true : m.group === group));
    result.sort((a, b) => {
      const cmp = (a.kickoff ?? "").localeCompare(b.kickoff ?? "");
      return sort === "newest" ? -cmp : cmp;
    });
    return result;
  }, [matches, status, group, sort]);

  const counts = useMemo(() => {
    const c: Record<MatchStatus, number> = {
      live: 0,
      scheduled: 0,
      finished: 0,
      postponed: 0,
    };
    matches.forEach((m) => (c[m.status] += 1));
    return c;
  }, [matches]);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={status === tab.key}
              className={cn(styles.tab, status === tab.key && styles.tabActive)}
              onClick={() => setStatus(tab.key)}
            >
              {tab.label}
              {tab.key === "live" && counts.live > 0 && (
                <span className={styles.liveDot} aria-hidden />
              )}
            </button>
          ))}
        </div>

        <div className={styles.selects}>
          <label className={styles.select}>
            <span>{t.matches.allGroups.split(" ")[0]}</span>
            <select value={group} onChange={(e) => setGroup(e.target.value as GroupId | "all")}>
              <option value="all">{t.matches.allGroups}</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {t.matches.groupLabel} {g}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.select}>
            <span>{t.matches.sort}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
              <option value="newest">{t.matches.newestFirst}</option>
              <option value="oldest">{t.matches.oldestFirst}</option>
            </select>
          </label>
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? t.matches.match : t.matches.matches}
      </p>

      {filtered.length > 0 ? (
        <motion.div layout className={styles.grid}>
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} showGroup />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title={t.matches.noMatches}
          description={t.matches.noMatchesDesc}
        />
      )}
    </div>
  );
}
