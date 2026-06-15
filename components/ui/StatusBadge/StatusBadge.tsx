import { cn } from "@/utils/cn";
import { statusLabel } from "@/utils/format";
import type { MatchStatus } from "@/types";
import styles from "./StatusBadge.module.scss";

interface Props {
  status: MatchStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span className={cn(styles.badge, styles[status], className)}>
      {status === "live" && <span className={styles.pulse} aria-hidden />}
      {statusLabel(status)}
    </span>
  );
}
