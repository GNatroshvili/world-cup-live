// Tiny classNames joiner — filters falsy values. Works with CSS-module class
// strings: cn(styles.card, isActive && styles.active).
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
