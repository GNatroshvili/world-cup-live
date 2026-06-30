import { cn } from "@/utils/cn";
import type { MatchResult } from "@/types";
import styles from "./FormPills.module.scss";

interface Props {
  form: MatchResult[];
  className?: string;
}

export function FormPills({ form, className }: Props) {
  if (!form.length) {
    return <span className={cn(styles.empty, className)}>—</span>;
  }
  return (
    <span className={cn(styles.row, className)} aria-label="Recent form">
      {form
        .slice()
        .reverse()
        .map((r, i) => (
          <span key={i} className={cn(styles.pill, styles[r])} title={r}>
            {r}
          </span>
        ))}
    </span>
  );
}
