"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { useT } from "@/components/providers/I18nProvider";
import styles from "./LiveStatus.module.scss";

interface Props {
  updatedAt: string;
  intervalMs?: number;
  className?: string;
}

const SYNC_FMT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
});


export function LiveStatus({
  updatedAt,
  intervalMs = 30_000,
  className,
}: Props) {
  const router = useRouter();
  const t = useT();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let last = Date.now();
    let pulse: number | undefined;

    const refresh = () => {
      last = Date.now();
      setRefreshing(true);
      router.refresh();
      pulse = window.setTimeout(() => setRefreshing(false), 900);
    };

    const onTick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - last > intervalMs
      ) {
        refresh();
      }
    };

    const id = window.setInterval(onTick, intervalMs);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(pulse);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);

  const synced = (() => {
    const d = new Date(updatedAt);
    return Number.isNaN(d.getTime()) ? "—" : `${SYNC_FMT.format(d)} UTC`;
  })();

  return (
    <span
      className={cn(styles.badge, refreshing && styles.refreshing, className)}
    >
      <span className={styles.dot} aria-hidden />
      <span className={styles.label}>{t.common.live}</span>
      <span className={styles.synced}>
        · {t.common.synced} {synced}
      </span>
    </span>
  );
}
