"use client";

import { cn } from "@/utils/cn";
import { useT } from "@/components/providers/I18nProvider";
import type { MatchStatus } from "@/types";
import styles from "./StatusBadge.module.scss";

interface Props {
  status: MatchStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const t = useT();

  const label: Record<MatchStatus, string> = {
    live: t.status.live,
    finished: t.status.fullTime,
    postponed: t.status.postponed,
    scheduled: t.status.upcoming,
  };

  return (
    <span className={cn(styles.badge, styles[status], className)}>
      {status === "live" && <span className={styles.pulse} aria-hidden />}
      {label[status]}
    </span>
  );
}
