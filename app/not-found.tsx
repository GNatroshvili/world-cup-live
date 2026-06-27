"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import { useT } from "@/components/providers/I18nProvider";
import styles from "./error.module.scss";

export default function NotFound() {
  const t = useT();
  return (
    <div className={`container ${styles.wrap}`}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>{t.common.notFound}</h1>
      <p className={styles.desc}>{t.common.notFoundDesc}</p>
      <div className={styles.actions}>
        <Link href="/">
          <Button>{t.common.backHome}</Button>
        </Link>
      </div>
    </div>
  );
}
