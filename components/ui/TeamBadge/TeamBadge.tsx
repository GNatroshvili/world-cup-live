import Image from "next/image";
import { cn } from "@/utils/cn";
import { teamInitials } from "@/utils/format";
import styles from "./TeamBadge.module.scss";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const PX: Record<Size, number> = { xs: 22, sm: 30, md: 42, lg: 64, xl: 96 };

interface Props {
  name: string;
  code?: string;
  badge?: string | null;
  size?: Size;
  className?: string;
}

function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export function TeamBadge({ name, code, badge, size = "md", className }: Props) {
  const px = PX[size];

  if (badge) {
    return (
      <span
        className={cn(styles.badge, styles[size], className)}
        style={{ width: px, height: px }}
      >
        <Image
          src={badge}
          alt={`${name} crest`}
          width={px}
          height={px}
          className={styles.img}
          sizes={`${px}px`}
          unoptimized={false}
        />
      </span>
    );
  }

  const h = hue(code ?? name);
  return (
    <span
      aria-label={`${name} crest`}
      role="img"
      className={cn(styles.badge, styles.monogram, styles[size], className)}
      style={{
        width: px,
        height: px,
        background: `linear-gradient(135deg, hsl(${h} 70% 42%), hsl(${(h + 40) % 360} 70% 30%))`,
      }}
    >
      <span className={styles.initials}>{code ?? teamInitials(name)}</span>
    </span>
  );
}
