import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import styles from "./error.module.scss";

export default function NotFound() {
  return (
    <div className={`container ${styles.wrap}`}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>This page is offside</h1>
      <p className={styles.desc}>
        The page you’re looking for doesn’t exist or has been moved. Let’s get you
        back to the action.
      </p>
      <div className={styles.actions}>
        <Link href="/">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
