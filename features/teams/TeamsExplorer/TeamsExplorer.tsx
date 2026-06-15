"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TeamCard } from "../TeamCard/TeamCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/uiStore";
import type { GroupId, Team } from "@/types";
import styles from "./TeamsExplorer.module.scss";

interface Props {
  teams: Team[];
  groups: GroupId[];
  initialQuery?: string;
}

export function TeamsExplorer({ teams, groups, initialQuery = "" }: Props) {
  // The store's searchQuery is the single source of truth, so the header
  // search field and this page's input stay in sync automatically.
  const query = useUIStore((s) => s.searchQuery);
  const setQuery = useUIStore((s) => s.setSearchQuery);
  const [group, setGroup] = useState<GroupId | "all">("all");

  // Seed the store once from the ?q= URL param (shared/deep links).
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && initialQuery) setQuery(initialQuery);
    seeded.current = true;
  }, [initialQuery, setQuery]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams
      .filter((t) => (group === "all" ? true : t.group === group))
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.shortName.toLowerCase().includes(q) ||
          (t.country ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, query, group]);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            placeholder="Search by team or country…"
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search teams"
          />
        </div>

        <div className={styles.chips} role="tablist" aria-label="Filter by group">
          <button
            className={cn(styles.chip, group === "all" && styles.chipActive)}
            onClick={() => setGroup("all")}
          >
            All
          </button>
          {groups.map((g) => (
            <button
              key={g}
              className={cn(styles.chip, group === g && styles.chipActive)}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? "team" : "teams"}
      </p>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No teams match your search"
          description="Try another name, country, or group."
        />
      )}
    </div>
  );
}
