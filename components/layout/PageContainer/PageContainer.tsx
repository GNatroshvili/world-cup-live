import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import styles from "./PageContainer.module.scss";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Standard padded inner-page wrapper with a gradient page title. */
export function PageContainer({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: Props) {
  return (
    <div className={cn("container", styles.page, className)}>
      <header className={styles.intro}>
        <div>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.desc}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {children}
    </div>
  );
}
