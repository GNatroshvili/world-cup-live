"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TeamCard } from "../TeamCard/TeamCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { cn } from "@/utils/cn";
import { useUIStore } from "@/store/uiStore";
import { useT } from "@/components/providers/I18nProvider";
import type { GroupId, Team } from "@/types";
import styles from "./TeamsExplorer.module.scss";

interface Props {
  teams: Team[];
  groups: GroupId[];
  initialQuery?: string;
}

export function TeamsExplorer({ teams, groups, initialQuery = "" }: Props) {
  const t = useT();
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
      .filter((team) => (group === "all" ? true : team.group === group))
      .filter(
        (team) =>
          !q ||
          team.name.toLowerCase().includes(q) ||
          team.shortName.toLowerCase().includes(q) ||
          (team.country ?? "").toLowerCase().includes(q),
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
            placeholder={t.common.searchTeams}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t.common.searchTeams}
          />
        </div>

        <div className={styles.chips} role="tablist" aria-label="Filter by group">
          <button
            className={cn(styles.chip, group === "all" && styles.chipActive)}
            onClick={() => setGroup("all")}
          >
            {t.teams.allGroups}
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
        {filtered.length} {filtered.length === 1 ? t.teams.group : t.teams.group}
      </p>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t.teams.noResults}
          description={t.teams.noResultsDesc}
        />
      )}
    </div>
  );
}
