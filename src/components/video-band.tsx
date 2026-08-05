"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Background video that only downloads once it is close to the viewport, and
 * never plays at all when reduced motion is requested — the poster still
 * carries the frame in that case.
 */
export function BackgroundVideo({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!video.src) video.src = src;
            void video.play().catch(() => {
              /* Autoplay refused: the poster stands in. */
            });
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
}
