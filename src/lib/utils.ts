/**
 * `cn` — the class-name joiner shadcn-derived components expect at
 * `@/lib/utils`.
 *
 * Deliberately not `clsx` + `tailwind-merge`. Those exist to resolve *conflicting*
 * Tailwind utilities at runtime, and nothing in this project relies on that:
 * the components that import this pass a static base plus an optional override,
 * which is a join. Two dependencies and a runtime class parser for that is a
 * worse trade than four lines.
 *
 * If a component is ever added that genuinely needs conflict resolution, swap
 * the body for `twMerge(clsx(input))` and every call site keeps working.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...input: ClassValue[]): string {
  return input.filter(Boolean).join(" ");
}
