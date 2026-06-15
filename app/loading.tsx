import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import styles from "./loading.module.scss";

export default function Loading() {
  return (
    <div className={`container ${styles.wrap}`} aria-busy="true" aria-label="Loading">
      <Skeleton width="220px" height="14px" />
      <Skeleton width="min(620px, 90%)" height="46px" />
      <Skeleton width="min(480px, 80%)" height="18px" />

      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton height="18px" width="40%" />
            <Skeleton height="60px" />
            <Skeleton height="14px" width="70%" />
          </div>
        ))}
      </div>
    </div>
  );
}
