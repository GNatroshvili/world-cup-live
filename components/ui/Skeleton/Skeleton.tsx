import { cn } from "@/utils/cn";
import styles from "./Skeleton.module.scss";

interface Props {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  circle?: boolean;
}

/** Shimmering placeholder block used in loading states. */
export function Skeleton({ width, height, radius, circle, className }: Props) {
  return (
    <span
      className={cn(styles.skeleton, className)}
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : radius,
      }}
    />
  );
}
