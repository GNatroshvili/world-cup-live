"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button/Button";
import { useT } from "@/components/providers/I18nProvider";
import styles from "./error.module.scss";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`container ${styles.wrap}`}>
      <span className={styles.code}>{t.common.error}</span>
      <h1 className={styles.title}>{t.common.error}</h1>
      <p className={styles.desc}>{t.common.offline}</p>
      <div className={styles.actions}>
        <Button onClick={reset}>{t.common.tryAgain}</Button>
      </div>
    </div>
  );
}
