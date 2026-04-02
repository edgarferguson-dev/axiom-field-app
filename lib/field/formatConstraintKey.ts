/** Display label for constraint keys like `missed-calls` → `Missed Calls` */
export function formatConstraintKey(key: string): string {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
