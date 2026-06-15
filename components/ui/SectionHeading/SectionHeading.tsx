import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import styles from "./SectionHeading.module.scss";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = "start",
  className,
}: Props) {
  return (
    <div className={cn(styles.wrap, styles[align], className)}>
      <div className={styles.text}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.desc}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
