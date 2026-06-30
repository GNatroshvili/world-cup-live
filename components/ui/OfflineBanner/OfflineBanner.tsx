"use client";

import { useT } from "@/components/providers/I18nProvider";
import styles from "./OfflineBanner.module.scss";

export function OfflineBanner() {
  const t = useT();
  return (
    <div className={styles.banner} role="status">
      <span className={styles.dot} aria-hidden />
      <span>{t.common.offline}</span>
    </div>
  );
}
