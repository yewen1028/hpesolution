import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui";

/**
 * Shown where content would otherwise be absent.
 *
 * Drawn the way the rest of the site is drawn — a hairline frame, an outlined
 * icon, no illustration. An illustrated empty state would be the only piece of
 * decorative artwork on the site and would read as borrowed.
 *
 * The message is the point: it says what is missing and offers the nearest
 * useful destination, rather than "No results found".
 *
 * Server component.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={`empty-state ${className}`}>
      <span className="empty-state__icon">
        <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
      </span>

      <h3 className="display-3 mt-6">{title}</h3>

      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
        {body}
      </p>

      {action && (
        <div className="mt-8">
          <ButtonLink href={action.href} variant="ghost">
            {action.label}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
