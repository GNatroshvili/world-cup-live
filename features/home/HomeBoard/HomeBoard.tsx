import { GroupCard } from "@/features/groups/GroupCard/GroupCard";
import { Bracket } from "@/features/bracket/Bracket/Bracket";
import type { Bracket as BracketType, Group } from "@/types";
import styles from "./HomeBoard.module.scss";

interface Props {
  groups: Group[];
  bracket: BracketType;
}

const LEFT_IDS = ["A", "B", "C", "D", "E", "F"];

export function HomeBoard({ groups, bracket }: Props) {
  const left = groups.filter((g) => LEFT_IDS.includes(g.id));
  const right = groups.filter((g) => !LEFT_IDS.includes(g.id));

  return (
    <div className={styles.board}>
      <section className={styles.column} aria-label="Groups A to F">
        <h2 className={styles.colTitle}>Groups A–F</h2>
        <div className={styles.groupStack}>
          {left.map((g, i) => (
            <GroupCard key={g.id} group={g} index={i} />
          ))}
        </div>
      </section>

      <section className={styles.center} id="bracket" aria-label="Knockout bracket">
        <div className={styles.centerHead}>
          <h2 className={styles.colTitle}>Knockout Bracket</h2>
          <p className={styles.centerSub}>
            Round of 32 through to the Final · tap any tie for details
          </p>
        </div>
        <Bracket bracket={bracket} />
      </section>

      <section className={styles.column} aria-label="Groups G to L">
        <h2 className={styles.colTitle}>Groups G–L</h2>
        <div className={styles.groupStack}>
          {right.map((g, i) => (
            <GroupCard key={g.id} group={g} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
