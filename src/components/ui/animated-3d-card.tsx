"use client";

import React, { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";
import {
  Code,
  Palette,
  Users,
  Zap,
  Globe,
  Heart,
  Star,
  Database,
  Shield,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   A pointer-tilted 3D card, vendored from an external component.

   Four things were changed on the way in, and all four are this project's
   rules rather than taste:

   1. **`motion/react`, not `framer-motion`.** They are the same library —
      Framer Motion was renamed `motion` at v11 — and `motion@12` is already a
      dependency here (`ui/progress-bar.tsx`, `ui/marquee-along-svg-path.tsx`
      import from it). Installing `framer-motion` as well would ship a second
      copy of the same animation engine.
   2. **Reduced motion is read from `data-motion`**, never from the media query
      — including `motion/react`'s own `useReducedMotion`, which asks the query
      directly. See "The motion preference" in CLAUDE.md: on Windows that query
      is routinely true on machines whose owner never asked for a still page,
      so this site resolves it once into an attribute a visitor can override.
      With motion off the card is a flat panel: no tilt, no shine, no pulse.
   3. **`cta`** — renders the bottom action row with your own label. Upstream
      it appears only when `onClick` is set, which makes it unreachable for a
      card that is wrapped in a real `<a>` rather than handling clicks itself.
   4. **`media`** — an optional node rendered in place of the built-in `<img>`,
      so a caller can pass `next/image` (and this project's `Media`, which adds
      the blur-up placeholder) instead of an unoptimised tag.

   `Card3DList` and `Component` below are upstream's grid and demo, kept so the
   component works as shipped. The home page's services section does **not**
   use them — it composes `Card3D` into its own grid, because those cards have
   to be anchors. See `sections/services-grid.tsx`.
--------------------------------------------------------------------------- */

export const THEMES = {
  primary: "from-slate-700 via-slate-800 to-slate-900",
  secondary: "from-blue-600 via-blue-700 to-blue-800",
  accent: "from-purple-600 via-purple-700 to-purple-800",
  success: "from-emerald-600 via-emerald-700 to-emerald-800",
  warning: "from-amber-600 via-amber-700 to-amber-800",
  danger: "from-red-600 via-red-700 to-red-800",
  info: "from-cyan-600 via-cyan-700 to-cyan-800",
  neutral: "from-gray-600 via-gray-700 to-gray-800",
} as const;

export type ThemeType = keyof typeof THEMES;

interface MousePos {
  readonly x: number;
  readonly y: number;
}

export interface Card3DProps {
  title: string;
  description: string;
  image?: string;
  /** Replaces the built-in `<img>`. Use for `next/image`. */
  media?: React.ReactNode;
  icon?: React.ReactNode;
  theme?: ThemeType;
  gradient?: string;
  onClick?: () => void;
  /** Label for the bottom action row. Shows it without needing `onClick`. */
  cta?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "premium";
  disabled?: boolean;
  loading?: boolean;
}

export interface CardData {
  id: string;
  title: string;
  description: string;
  image?: string;
  media?: React.ReactNode;
  icon?: React.ReactNode;
  theme?: ThemeType;
  gradient?: string;
  onClick?: () => void;
  cta?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface Card3DListProps {
  cards: CardData[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg" | "xl";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "premium";
  animated?: boolean;
  staggerDelay?: number;
}

const SIZES = {
  sm: "h-64",
  md: "h-80",
  lg: "h-96",
} as const;

const VARIANTS = {
  default: "shadow-lg hover:shadow-2xl",
  minimal: "shadow-md hover:shadow-lg border border-white/10",
  premium: "shadow-xl hover:shadow-2xl ring-1 ring-white/20",
} as const;

const GRIDS = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

const GAPS = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-10",
} as const;

const EASE_OUT_QUINT = [0.23, 1, 0.32, 1] as const;

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
      duration: 0.5,
      ease: EASE_OUT_QUINT,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12, mass: 0.7 },
  },
} as const;

/**
 * `true` while the site is in its full-motion state.
 *
 * `useSyncExternalStore` rather than a mount effect: the server has no resolved
 * preference, so it renders the still card and the client settles on hydration
 * without a state write inside an effect. `subscribeMotion` covers both the OS
 * query and the header's own toggle.
 */
const serverFalse = () => false;
export function useSiteMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => !prefersReducedMotion(),
    serverFalse,
  );
}

export const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  (
    {
      title,
      description,
      image,
      media,
      icon,
      theme = "primary",
      gradient,
      onClick,
      cta,
      className,
      size = "md",
      variant = "default",
      disabled = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const animate = useSiteMotion();

    const finalGradient = useMemo(
      () => gradient || THEMES[theme],
      [gradient, theme]
    );
    const patternId = useMemo(
      () => `pattern-${theme}-${title.replace(/\s+/g, "-").toLowerCase()}`,
      [theme, title]
    );

    // `frozen` is the whole reduced-motion bail-out: every animated value below
    // reads through it, so one flag turns the card into a static panel.
    const frozen = disabled || !animate;

    const handleMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (frozen) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({
          x: (x / rect.width - 0.5) * 25,
          y: (y / rect.height - 0.5) * -25,
        });
      },
      [frozen]
    );

    const handleEnter = useCallback(() => {
      if (disabled) return;
      setHovered(true);
    }, [disabled]);

    const handleLeave = useCallback(() => {
      if (disabled) return;
      setHovered(false);
      setMousePos({ x: 0, y: 0 });
    }, [disabled]);

    const handleClick = useCallback(() => {
      if (disabled || loading || !onClick) return;
      onClick();
    }, [disabled, loading, onClick]);

    const showCta = Boolean(cta || onClick) && !disabled;

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl transform-gpu transition-all duration-500 ease-out",
          SIZES[size],
          VARIANTS[variant],
          onClick && !disabled && !loading && "cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          loading && "pointer-events-none",
          className
        )}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        animate={{
          rotateX: frozen ? 0 : mousePos.y,
          rotateY: frozen ? 0 : mousePos.x,
          z: frozen ? 0 : hovered ? 30 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
        whileTap={
          frozen || !onClick
            ? {}
            : {
                scale: 0.98,
                rotateX: mousePos.y + 3,
                rotateY: mousePos.x + 3,
              }
        }
        onClick={handleClick}
        style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
        role={onClick ? "button" : "article"}
        tabIndex={onClick && !disabled ? 0 : -1}
        {...props}
      >
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl",
            image || media ? "" : `bg-gradient-to-br ${finalGradient}`
          )}
          animate={{ scale: hovered && !frozen ? 1.02 : 1 }}
          transition={{ duration: 0.4 }}
          style={{ transform: "translateZ(-10px)" }}
        >
          {media
            ? media
            : image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500"
                  loading="lazy"
                />
              )}
        </motion.div>

        <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-20">
          <svg
            className="absolute -top-4 -right-4 w-32 h-32 text-white/30"
            viewBox="0 0 100 100"
          >
            <defs>
              <pattern
                id={patternId}
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="1"
                  fill="currentColor"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>

          <motion.div
            className="absolute -bottom-4 -left-4 w-24 h-24 opacity-30"
            animate={{ rotate: hovered && !frozen ? 180 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full text-white/40">
              <rect
                x="20"
                y="20"
                width="60"
                height="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                rx="8"
              />
              <rect
                x="35"
                y="35"
                width="30"
                height="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                rx="4"
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)`,
            transform: "translateZ(5px)",
          }}
          animate={{ opacity: hovered && !frozen ? 0.5 : 0.7 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          style={{ transform: "translateZ(15px)" }}
        >
          <motion.div
            className="absolute -inset-full"
            animate={{
              background:
                hovered && !frozen
                  ? `linear-gradient(${mousePos.x + 135}deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)`
                  : "transparent",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <motion.div
          className="relative z-20 flex h-full flex-col justify-between p-6 text-white"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex justify-between items-start">
            {icon && (
              <motion.div
                className="relative"
                whileHover={frozen ? {} : { scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="text-3xl opacity-90 filter drop-shadow-lg"
                  animate={{
                    rotateZ: hovered && !frozen ? 5 : 0,
                    y: hovered && !frozen ? -2 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {icon}
                </motion.div>
              </motion.div>
            )}

            <motion.div
              className="relative"
              animate={{ scale: hovered && !frozen ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-white/40 backdrop-blur-sm" />
              {!frozen && (
                <motion.div
                  className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-white/70"
                  animate={{
                    scale: hovered ? [1, 1.4, 1] : 1,
                    opacity: hovered ? [0.7, 0.3, 0.7] : 0.7,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: hovered ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>
          </div>

          <motion.div
            className="space-y-3"
            animate={{ y: hovered && !frozen ? -3 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/*
              `text-white` explicitly, not inherited from the `text-white` on
              the content block above. This project's base layer sets
              `h1,h2,h3,h4 { color: var(--color-ink) }`, and a rule that names
              the element beats a colour inherited from an ancestor — so the
              title rendered in near-black on a dark photograph and every card
              but the hovered one lost its heading. Upstream has no base
              heading colour and never sees this.
            */}
            <motion.h3
              className="text-xl font-semibold tracking-tight text-white drop-shadow-md"
              animate={{ scale: hovered && !frozen ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h3>

            <motion.p
              className="text-sm text-white/85 leading-relaxed drop-shadow-sm line-clamp-3"
              animate={{ opacity: hovered ? 1 : 0.85 }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>

            {showCta && (
              <motion.div
                className="flex items-center space-x-2"
                animate={{
                  x: hovered || frozen ? 0 : -8,
                  opacity: hovered || frozen ? 1 : 0,
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="h-0.5 w-4 bg-white/70 rounded-full" />
                <div className="text-xs font-medium opacity-90">
                  {loading ? "Loading..." : (cta ?? "Explore")}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)`,
            transform: "translateZ(25px)",
          }}
          animate={{ opacity: hovered && !frozen ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        />

        {!frozen && (
          <motion.div
            className="absolute -inset-0.5 rounded-2xl opacity-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${finalGradient})`,
              filter: "blur(15px)",
              transform: "translateZ(-5px)",
            }}
            animate={{ opacity: hovered ? 0.2 : 0 }}
            transition={{ duration: 0.4 }}
          />
        )}

        {loading && (
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            style={{ transform: "translateZ(30px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </motion.div>
    );
  }
);

Card3D.displayName = "Card3D";

export const Card3DList: React.FC<Card3DListProps> = ({
  cards,
  className,
  columns = 3,
  gap = "md",
  size = "md",
  variant = "default",
  animated = true,
  staggerDelay = 0.08,
}) => {
  const siteMotion = useSiteMotion();
  const live = animated && siteMotion;

  const gridClass = useMemo(() => GRIDS[columns], [columns]);
  const gapClass = useMemo(() => GAPS[gap], [gap]);

  const customVariants = useMemo(
    () => ({
      ...containerVariants,
      visible: {
        ...containerVariants.visible,
        transition: {
          ...containerVariants.visible.transition,
          staggerChildren: staggerDelay,
        },
      },
    }),
    [staggerDelay]
  );

  const elements = useMemo(
    () =>
      cards.map((card, index) => (
        <motion.div
          key={card.id}
          variants={live ? itemVariants : undefined}
          custom={index}
          whileInView={live ? "visible" : undefined}
          initial={live ? "hidden" : undefined}
          viewport={
            live ? { once: true, margin: "-50px", amount: 0.2 } : undefined
          }
          style={{ transformStyle: "preserve-3d" }}
        >
          <Card3D
            title={card.title}
            description={card.description}
            image={card.image}
            media={card.media}
            icon={card.icon}
            theme={card.theme}
            gradient={card.gradient}
            onClick={card.onClick}
            cta={card.cta}
            size={size}
            variant={variant}
            disabled={card.disabled}
            loading={card.loading}
          />
        </motion.div>
      )),
    [cards, size, variant, live]
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015]">
          <svg
            width="100%"
            height="100%"
            className="text-slate-900 dark:text-white"
          >
            <defs>
              <pattern
                id="grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {live && (
          <>
            <motion.div
              className="absolute top-10 right-10 w-64 h-64 opacity-[0.03]"
              animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-slate-600 dark:text-slate-400"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </svg>
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-10 w-48 h-48 opacity-[0.02]"
              animate={{ rotate: [360, 0], y: [-10, 10, -10] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                viewBox="0 0 150 150"
                className="w-full h-full text-slate-600 dark:text-slate-400"
              >
                <rect
                  x="25"
                  y="25"
                  width="100"
                  height="100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  rx="8"
                />
                <rect
                  x="40"
                  y="40"
                  width="70"
                  height="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  rx="4"
                />
                <rect
                  x="55"
                  y="55"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  rx="2"
                />
              </svg>
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        className={cn("relative grid w-full", gridClass, gapClass, className)}
        variants={live ? customVariants : undefined}
        initial={live ? "hidden" : undefined}
        animate={live ? "visible" : undefined}
        style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
      >
        {elements}
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent dark:from-black/20 pointer-events-none" />
    </div>
  );
};

export const Component = () => {
  const cards: CardData[] = [
    {
      id: "web-dev",
      title: "Web Development",
      description:
        "Master modern web technologies with React, Next.js, and TypeScript. Build scalable applications with cutting-edge tools and best practices.",
      icon: <Code />,
      theme: "primary",
    },
    {
      id: "ui-ux",
      title: "UI/UX Design",
      description:
        "Create beautiful and intuitive user experiences that delight users and drive engagement through thoughtful design principles.",
      icon: <Palette />,
      theme: "secondary",
    },
    {
      id: "data",
      title: "Data Science",
      description:
        "Analyze complex data sets and build powerful machine learning models to extract meaningful insights from big data.",
      icon: <Database />,
      theme: "info",
    },
    {
      id: "security",
      title: "Cybersecurity",
      description:
        "Protect digital assets and infrastructure with advanced security protocols and threat detection methodologies.",
      icon: <Shield />,
      theme: "danger",
    },
    {
      id: "leadership",
      title: "Team Leadership",
      description:
        "Build and manage high-performing teams that collaborate effectively and achieve exceptional results through strategic guidance.",
      icon: <Users />,
      theme: "success",
    },
    {
      id: "innovation",
      title: "Innovation",
      description:
        "Drive innovation in your organization by fostering creativity and implementing breakthrough solutions for complex challenges.",
      icon: <Zap />,
      theme: "accent",
    },
    {
      id: "impact",
      title: "Global Impact",
      description:
        "Create solutions that make a meaningful difference worldwide and contribute to positive social change at scale.",
      icon: <Globe />,
      theme: "neutral",
    },
    {
      id: "community",
      title: "Community",
      description:
        "Connect with like-minded professionals, share knowledge, and build lasting relationships in your industry network.",
      icon: <Heart />,
      theme: "warning",
    },
    {
      id: "excellence",
      title: "Excellence",
      description:
        "Strive for excellence in everything you do and continuously improve your skills, capabilities, and professional expertise.",
      icon: <Star />,
      theme: "secondary",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <Card3DList
            cards={cards}
            columns={3}
            gap="lg"
            size="md"
            variant="premium"
            className="mb-20"
          />
        </div>
      </div>
    </div>
  );
};
