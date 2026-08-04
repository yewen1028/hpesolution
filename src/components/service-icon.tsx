import {
  Boxes,
  Headset,
  Network,
  ServerCog,
  ShieldCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/site";

/**
 * The seven service glyphs, in their own module.
 *
 * They used to live in `ui.tsx`, which also exports `ParallaxBand` and so
 * imports `Media`, `Parallax`, `ParallaxWindow`, `Reveal` and `AnimatedText`.
 * The header's services flyout is a client component and needs the icons, and
 * importing them from `ui.tsx` would have pulled that entire tree into the
 * header's chunk for the sake of seven glyphs. `ui.tsx` re-exports this, so
 * every existing import site is unchanged.
 *
 * `strokeWidth` is 1.5 here per the house rule for feature icons.
 */
const icons: Record<IconName, LucideIcon> = {
  ServerCog,
  Boxes,
  Headset,
  Users,
  ShieldCheck,
  Network,
  Wrench,
};

export function ServiceIcon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Icon = icons[name];
  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    />
  );
}
