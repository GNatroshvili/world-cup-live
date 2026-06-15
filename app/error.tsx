"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./error.module.scss";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in server/client logs for diagnostics.
    console.error(error);
  }, [error]);

  return (
    <div className={`container ${styles.wrap}`}>
      <span className={styles.code}>Something went wrong</span>
      <h1 className={styles.title}>We couldn’t load this view</h1>
      <p className={styles.desc}>
        The live data feed may be temporarily unavailable. Please try again in a
        moment.
      </p>
      <div className={styles.actions}>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
