import { useEffect, useRef, useState } from "react";

const IMAGES = [
  "https://images.pexels.com/photos/9572664/pexels-photo-9572664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/877971/pexels-photo-877971.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/34149049/pexels-photo-34149049.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/37302575/pexels-photo-37302575.png?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/12859451/pexels-photo-12859451.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/15881387/pexels-photo-15881387.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/14070726/pexels-photo-14070726.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/6387592/pexels-photo-6387592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/38854783/pexels-photo-38854783.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/25341736/pexels-photo-25341736.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/30947330/pexels-photo-30947330.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "https://images.pexels.com/photos/31529524/pexels-photo-31529524.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
];

type Props = {
  className?: string;
};

/**
 * A subtle, elegant corridor of book-related imagery.
 * Images drift slowly upward with gentle cross-fades, evoking
 * the feeling of walking through a library corridor.
 */
export function ImageStreamHero({ className }: Props) {
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const [visibleIndices, setVisibleIndices] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const offsetRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const interval = setInterval(() => {
      offsetRef.current = (offsetRef.current + 1) % IMAGES.length;
      const next: number[] = [];
      for (let i = 0; i < 6; i++) {
        next.push((offsetRef.current + i) % IMAGES.length);
      }
      setVisibleIndices(next);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ perspective: "1200px" }}
    >
      {/* Warm overlay so images feel integrated, not flashy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--paper-deep) 0%, transparent 25%, transparent 60%, var(--paper-deep) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 50%, transparent 40%, color-mix(in oklab, var(--paper-deep) 60%, transparent) 100%)",
        }}
      />

      <div className="relative flex h-full w-full items-center justify-center gap-3 sm:gap-5">
        {visibleIndices.map((idx, slot) => {
          const isCenter = slot === 2 || slot === 3;
          const distance = Math.abs(slot - 2.5);
          const scale = isCenter ? 1 : 1 - distance * 0.08;
          const opacity = loaded.has(idx) ? 1 - distance * 0.12 : 0;
          const translateY = (slot - 2.5) * 6;

          return (
            <div
              key={`${idx}-${slot}`}
              className="corridor-panel relative overflow-hidden rounded-sm"
              style={{
                width: `clamp(80px, 16vw, 200px)`,
                height: `clamp(120px, 28vw, 320px)`,
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity: Math.max(0.15, opacity),
                transition: "opacity 1.2s ease, transform 1.2s ease",
                animationDelay: `${slot * 1.5}s`,
                zIndex: isCenter ? 5 : 10 - Math.floor(distance * 2),
                boxShadow: isCenter
                  ? "0 20px 50px -20px rgba(58,44,36,0.35)"
                  : "0 10px 30px -16px rgba(58,44,36,0.2)",
              }}
            >
              <img
                src={IMAGES[idx]}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
                style={{ filter: "sepia(0.15) saturate(0.85) brightness(0.95)" }}
                onLoad={() => {
                  setLoaded((prev) => new Set(prev).add(idx));
                }}
              />
              {/* Warm tint per panel */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, color-mix(in oklab, var(--lamplight) 8%, transparent) 100%)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
