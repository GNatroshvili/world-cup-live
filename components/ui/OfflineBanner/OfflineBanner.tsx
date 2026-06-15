import styles from "./OfflineBanner.module.scss";

/** Shown when live data could not be fetched and seed structure is displayed. */
export function OfflineBanner() {
  return (
    <div className={styles.banner} role="status">
      <span className={styles.dot} aria-hidden />
      <span>
        Live data is temporarily unavailable — showing the tournament structure.
        Scores and standings will refresh automatically once the feed returns.
      </span>
    </div>
  );
}
