"use client";

import React, {
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import {
  motion,
  type SpringOptions,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Local fixes                                                               */
/* -------------------------------------------------------------------------- */

/*
 * Three changes from the component as published. The first is a correctness
 * bug, the second is required for the way this site uses it, the third is a
 * house rule:
 *
 *  1. **Hooks no longer run inside `.map()`.** The original calls
 *     `useTransform`, `useMotionValue` and `useEffect` per item inside the
 *     render loop, which breaks the Rules of Hooks — it survives only while the
 *     item count never changes, and `react-hooks/rules-of-hooks` fails the
 *     build outright. Each item is now its own component, so its hooks are top
 *     level and the count may change freely.
 *
 *  2. **`useScroll` only takes a container when one is given.** The original
 *     always passes its own wrapper, which is not a scroll container — so
 *     `useScrollVelocity` measured a value that never moved and the scroll
 *     coupling silently did nothing on a normally-scrolling page. Omitting the
 *     option tracks the window, which is what a page-level marquee wants.
 *
 *  3. **A `paused` prop.** Everything on this site stops under the reader's
 *     motion preference, and an always-on `useAnimationFrame` has no way to.
 */

const wrap = (min: number, max: number, value: number): number => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

type PreserveAspectRatioAlign =
  | "none"
  | "xMinYMin"
  | "xMidYMin"
  | "xMaxYMin"
  | "xMinYMid"
  | "xMidYMid"
  | "xMaxYMid"
  | "xMinYMax"
  | "xMidYMax"
  | "xMaxYMax";

interface CSSVariableInterpolation {
  property: string;
  from: number | string;
  to: number | string;
}

type PreserveAspectRatioMeetOrSlice = "meet" | "slice";

type PreserveAspectRatio =
  | PreserveAspectRatioAlign
  | `${Exclude<PreserveAspectRatioAlign, "none">} ${PreserveAspectRatioMeetOrSlice}`;

interface MarqueeAlongSvgPathProps {
  children: React.ReactNode;
  className?: string;

  path: string;
  pathId?: string;
  preserveAspectRatio?: PreserveAspectRatio;
  showPath?: boolean;

  width?: string | number;
  height?: string | number;
  viewBox?: string;

  baseVelocity?: number;
  direction?: "normal" | "reverse";
  easing?: (value: number) => number;
  slowdownOnHover?: boolean;
  slowDownFactor?: number;
  slowDownSpringConfig?: SpringOptions;

  useScrollVelocity?: boolean;
  scrollAwareDirection?: boolean;
  scrollSpringConfig?: SpringOptions;
  scrollContainer?: RefObject<HTMLElement | null> | HTMLElement | null;

  repeat?: number;

  draggable?: boolean;
  dragSensitivity?: number;
  dragVelocityDecay?: number;
  dragAwareDirection?: boolean;
  grabCursor?: boolean;

  enableRollingZIndex?: boolean;
  zIndexBase?: number;
  zIndexRange?: number;

  cssVariableInterpolation?: CSSVariableInterpolation[];

  responsive?: boolean;

  /** Freeze the strip where it stands. Added for the motion preference. */
  paused?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  One item on the path                                                       */
/* -------------------------------------------------------------------------- */

/*
 * Extracted purely so its hooks are top level. Everything in here was inline in
 * the original's render loop.
 */
function PathItem({
  child,
  itemIndex,
  itemCount,
  path,
  baseOffset,
  easing,
  calculateZIndex,
  enableRollingZIndex,
  cssVariableInterpolation,
  grabCursor,
  draggable,
  hidden,
  onHoverChange,
}: {
  child: React.ReactNode;
  itemIndex: number;
  itemCount: number;
  path: string;
  baseOffset: ReturnType<typeof useMotionValue<number>>;
  easing?: (value: number) => number;
  calculateZIndex: (offsetDistance: number) => number | undefined;
  enableRollingZIndex: boolean;
  cssVariableInterpolation: CSSVariableInterpolation[];
  grabCursor: boolean;
  draggable: boolean;
  hidden: boolean;
  onHoverChange: (hovered: boolean) => void;
}) {
  const itemOffset = useTransform(baseOffset, (v: number) => {
    const position = (itemIndex * 100) / itemCount;
    const wrappedValue = wrap(0, 100, v + position);
    return `${easing ? easing(wrappedValue / 100) * 100 : wrappedValue}%`;
  });

  const currentOffsetDistance = useMotionValue(0);

  const zIndex = useTransform(currentOffsetDistance, (value: number) =>
    calculateZIndex(value),
  );

  useEffect(() => {
    const unsubscribe = itemOffset.on("change", (value: string) => {
      const match = value.match(/^([\d.]+)%$/);
      if (match && match[1]) currentOffsetDistance.set(parseFloat(match[1]));
    });
    return unsubscribe;
  }, [itemOffset, currentOffsetDistance]);

  /*
   * The original built these with `useTransform` inside `Object.fromEntries`,
   * i.e. a hook inside a loop inside a loop. Hooks cannot be called
   * conditionally or in variable numbers, so the interpolations are read from
   * a fixed-length list — the first four cover every use this site has, and
   * anything beyond that is ignored rather than silently corrupting the hook
   * order.
   */
  const v0 = useTransform(currentOffsetDistance, [0, 100], [
    cssVariableInterpolation[0]?.from ?? 0,
    cssVariableInterpolation[0]?.to ?? 0,
  ]);
  const v1 = useTransform(currentOffsetDistance, [0, 100], [
    cssVariableInterpolation[1]?.from ?? 0,
    cssVariableInterpolation[1]?.to ?? 0,
  ]);
  const v2 = useTransform(currentOffsetDistance, [0, 100], [
    cssVariableInterpolation[2]?.from ?? 0,
    cssVariableInterpolation[2]?.to ?? 0,
  ]);
  const v3 = useTransform(currentOffsetDistance, [0, 100], [
    cssVariableInterpolation[3]?.from ?? 0,
    cssVariableInterpolation[3]?.to ?? 0,
  ]);

  const cssVariables = useMemo(() => {
    const values = [v0, v1, v2, v3];
    return Object.fromEntries(
      cssVariableInterpolation
        .slice(0, 4)
        .map(({ property }, i) => [property, values[i]]),
    );
  }, [cssVariableInterpolation, v0, v1, v2, v3]);

  return (
    <motion.div
      className={cn(
        "absolute top-0 left-0",
        draggable && grabCursor && "cursor-grab",
      )}
      style={{
        offsetPath: `path('${path}')`,
        offsetDistance: itemOffset,
        zIndex: enableRollingZIndex ? zIndex : undefined,
        willChange: "offset-distance",
        backfaceVisibility: "hidden",
        ...cssVariables,
      }}
      aria-hidden={hidden}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {child}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

const MarqueeAlongSvgPath = ({
  children,
  className,

  path,
  pathId,
  preserveAspectRatio = "xMidYMid meet",
  showPath = false,

  width = "100%",
  height = "100%",
  viewBox = "0 0 100 100",

  baseVelocity = 5,
  direction = "normal",
  easing,
  slowdownOnHover = false,
  slowDownFactor = 0.3,
  slowDownSpringConfig = { damping: 50, stiffness: 400 },

  useScrollVelocity = false,
  scrollAwareDirection = false,
  scrollSpringConfig = { damping: 50, stiffness: 400 },
  scrollContainer,

  repeat = 3,

  draggable = false,
  dragSensitivity = 0.2,
  dragVelocityDecay = 0.96,
  dragAwareDirection = false,
  grabCursor = false,

  enableRollingZIndex = true,
  zIndexBase = 1,
  zIndexRange = 10,

  cssVariableInterpolation = [],

  responsive = false,
  paused = false,
}: MarqueeAlongSvgPathProps) => {
  const container = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const baseOffset = useMotionValue(0);

  useEffect(() => {
    if (!responsive) return;

    const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
    const originalWidth = vbWidth || 100;
    const originalHeight = vbHeight || 100;

    const updateScale = () => {
      const wrapper = container.current;
      const marqueeContainer = marqueeContainerRef.current;
      if (!wrapper || !marqueeContainer) return;

      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;

      const scale = Math.min(
        wrapperWidth / originalWidth,
        wrapperHeight / originalHeight,
      );

      const offsetX = (wrapperWidth - originalWidth * scale) / 2;
      const offsetY = (wrapperHeight - originalHeight * scale) / 2;

      marqueeContainer.style.width = `${originalWidth}px`;
      marqueeContainer.style.height = `${originalHeight}px`;
      marqueeContainer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      marqueeContainer.style.transformOrigin = "top left";
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [responsive, viewBox]);

  const items = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children);

    return childrenArray.flatMap((child, childIndex) =>
      Array.from({ length: repeat }, (_, repeatIndex) => ({
        child,
        childIndex,
        repeatIndex,
        itemIndex: repeatIndex * childrenArray.length + childIndex,
        key: `${childIndex}-${repeatIndex}`,
      })),
    );
  }, [children, repeat]);

  const calculateZIndex = useCallback(
    (offsetDistance: number) => {
      if (!enableRollingZIndex) return undefined;
      return Math.floor(zIndexBase + (offsetDistance / 100) * zIndexRange);
    },
    [enableRollingZIndex, zIndexBase, zIndexRange],
  );

  /*
   * `useId`, not `Math.random()` as published. Random during render is impure —
   * the lint rule catches it — and on a prerendered page it is worse than
   * untidy: the server and the client would generate different ids for the same
   * path and React would report a hydration mismatch. `useId` is stable across
   * both and unique per instance.
   */
  const generatedId = useId();
  const id = pathId || `marquee-path-${generatedId.replace(/:/g, "")}`;

  // See fix 2 at the top of this file: a container is only passed when the
  // caller actually has one, so page scroll is tracked by default.
  const { scrollY } = useScroll(
    scrollContainer
      ? { container: scrollContainer as RefObject<HTMLDivElement | null> }
      : undefined,
  );

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, scrollSpringConfig);

  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const dragVelocity = useRef(0);

  const directionFactor = useRef(direction === "normal" ? 1 : -1);

  const hoverFactorValue = useMotionValue(1);
  const defaultVelocity = useMotionValue(1);
  const smoothHoverFactor = useSpring(hoverFactorValue, slowDownSpringConfig);

  const velocityFactor = useTransform(
    useScrollVelocity ? smoothVelocity : defaultVelocity,
    [0, 1000],
    [0, 5],
    { clamp: false },
  );

  const setHovered = useCallback((hovered: boolean) => {
    isHovered.current = hovered;
  }, []);

  useAnimationFrame((_, delta) => {
    /*
     * Dragging is checked before `paused`, deliberately. `paused` exists to
     * stop the *automatic* travel under the motion preference — it is not a
     * reason to make the strip inert. Direct manipulation is the reader moving
     * something with their own hand, which is not the kind of movement that
     * preference is asking to be spared, and a strip that refuses to be
     * dragged just reads as broken.
     */
    if (isDragging.current && draggable) {
      baseOffset.set(baseOffset.get() + dragVelocity.current);
      dragVelocity.current *= 0.9;
      if (Math.abs(dragVelocity.current) < 0.01) dragVelocity.current = 0;
      return;
    }

    if (paused) {
      // Let a released flick run out, then stand still. Without this the strip
      // would stop dead the moment the finger lifted.
      if (draggable && Math.abs(dragVelocity.current) > 0.01) {
        baseOffset.set(baseOffset.get() + dragVelocity.current);
        dragVelocity.current *= dragVelocityDecay;
      } else {
        dragVelocity.current = 0;
      }
      return;
    }

    hoverFactorValue.set(
      isHovered.current && slowdownOnHover ? slowDownFactor : 1,
    );

    let moveBy =
      directionFactor.current *
      baseVelocity *
      (delta / 1000) *
      smoothHoverFactor.get();

    if (scrollAwareDirection && !isDragging.current) {
      if (velocityFactor.get() < 0) directionFactor.current = -1;
      else if (velocityFactor.get() > 0) directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    if (draggable) {
      moveBy += dragVelocity.current;

      if (dragAwareDirection && Math.abs(dragVelocity.current) > 0.1) {
        directionFactor.current = Math.sign(dragVelocity.current);
      }

      if (!isDragging.current && Math.abs(dragVelocity.current) > 0.01) {
        dragVelocity.current *= dragVelocityDecay;
      } else if (!isDragging.current) {
        dragVelocity.current = 0;
      }
    }

    baseOffset.set(baseOffset.get() + moveBy);
  });

  const lastPointerPosition = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (grabCursor) (e.currentTarget as HTMLElement).style.cursor = "grabbing";
    isDragging.current = true;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    dragVelocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggable || !isDragging.current) return;

    const deltaX = e.clientX - lastPointerPosition.current.x;
    const deltaY = e.clientY - lastPointerPosition.current.y;
    const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    dragVelocity.current = (deltaX > 0 ? delta : -delta) * dragSensitivity;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggable) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    isDragging.current = false;
    if (grabCursor) (e.currentTarget as HTMLElement).style.cursor = "grab";
  };

  return (
    <div
      ref={container}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn("relative", className)}
      /*
       * `pan-y` so a vertical swipe still scrolls the page. Without it the
       * pointer capture taken on `pointerdown` swallows the gesture and the
       * section becomes a trap on a phone: you touch it to scroll past and the
       * page stays put. Horizontal movement is still ours to drag with.
       */
      style={draggable ? { touchAction: "pan-y" } : undefined}
    >
      <div
        ref={marqueeContainerRef}
        className="relative"
        style={{ contain: "layout style" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox={viewBox}
          preserveAspectRatio={preserveAspectRatio}
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            id={id}
            d={path}
            stroke={showPath ? "currentColor" : "none"}
            fill="none"
          />
        </svg>

        {items.map(({ child, repeatIndex, itemIndex, key }) => (
          <PathItem
            key={key}
            child={child}
            itemIndex={itemIndex}
            itemCount={items.length}
            path={path}
            baseOffset={baseOffset}
            easing={easing}
            calculateZIndex={calculateZIndex}
            enableRollingZIndex={enableRollingZIndex}
            cssVariableInterpolation={cssVariableInterpolation}
            grabCursor={grabCursor}
            draggable={draggable}
            hidden={repeatIndex > 0}
            onHoverChange={setHovered}
          />
        ))}
      </div>
    </div>
  );
};

export default MarqueeAlongSvgPath;
