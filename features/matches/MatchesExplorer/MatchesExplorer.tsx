"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MatchCard } from "../MatchCard/MatchCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { cn } from "@/utils/cn";
import type { GroupId, Match, MatchStatus } from "@/types";
import styles from "./MatchesExplorer.module.scss";

type StatusFilter = "all" | "live" | "upcoming" | "finished";
type SortOrder = "newest" | "oldest";

interface Props {
  matches: Match[];
  groups: GroupId[];
  initialStatus?: StatusFilter;
}

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "finished", label: "Completed" },
];

function matchesStatus(m: Match, f: StatusFilter): boolean {
  if (f === "all") return true;
  if (f === "live") return m.status === "live";
  if (f === "upcoming") return m.status === "scheduled" || m.status === "postponed";
  return m.status === "finished";
}

export function MatchesExplorer({ matches, groups, initialStatus = "all" }: Props) {
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [group, setGroup] = useState<GroupId | "all">("all");
  const [sort, setSort] = useState<SortOrder>("newest");

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
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={status === t.key}
              className={cn(styles.tab, status === t.key && styles.tabActive)}
              onClick={() => setStatus(t.key)}
            >
              {t.label}
              {t.key === "live" && counts.live > 0 && (
                <span className={styles.liveDot} aria-hidden />
              )}
            </button>
          ))}
        </div>

        <div className={styles.selects}>
          <label className={styles.select}>
            <span>Group</span>
            <select value={group} onChange={(e) => setGroup(e.target.value as GroupId | "all")}>
              <option value="all">All groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  Group {g}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.select}>
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? "match" : "matches"}
      </p>

      {filtered.length > 0 ? (
        <motion.div layout className={styles.grid}>
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} showGroup />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title="No matches found"
          description="Try a different status or group filter."
        />
      )}
    </div>
  );
}
