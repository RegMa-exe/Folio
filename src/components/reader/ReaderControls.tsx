import type { ReadingTheme } from "@/lib/reading-storage";

const THEMES: { id: ReadingTheme; label: string; swatch: string }[] = [
  { id: "classic", label: "Classic Paper", swatch: "#FBF7EF" },
  { id: "ivory", label: "Warm Ivory", swatch: "#F4EBD9" },
  { id: "beige", label: "Warm Paper", swatch: "#E9DCC6" },
  { id: "dark", label: "Dark Reading", swatch: "#211C17" },
];

type Props = {
  visible: boolean;
  title: string;
  page: number;
  total: number;
  bookmarked: boolean;
  soundOn: boolean;
  theme: ReadingTheme;
  onPrev: () => void;
  onNext: () => void;
  onToggleBookmark: () => void;
  onToggleSound: () => void;
  onTheme: (theme: ReadingTheme) => void;
  onExit: () => void;
};

export function ReaderControls({
  visible,
  title,
  page,
  total,
  bookmarked,
  soundOn,
  theme,
  onPrev,
  onNext,
  onToggleBookmark,
  onToggleSound,
  onTheme,
  onExit,
}: Props) {
  const shell =
    "transition-opacity duration-500 " + (visible ? "opacity-100" : "opacity-0 pointer-events-none");
  const button =
    "grid size-9 place-items-center rounded-full border border-current/15 transition-colors hover:bg-current/10";

  return (
    <>
      {/* progress hairline — always visible, very quiet */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[2px] bg-current/10">
        <div
          className="h-full bg-lamplight transition-[width] duration-300"
          style={{ width: `${total ? (page / total) * 100 : 0}%` }}
        />
      </div>

      {/* Header — container is pass-through; only the interactive children capture clicks */}
      <div
        className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-4 py-4 sm:px-8 ${shell} pointer-events-none`}
      >
        <button
          data-reader-control
          onClick={onExit}
          className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.25em] opacity-70 transition-opacity hover:opacity-100"
        >
          ← Close book
        </button>
        <p className="truncate font-display text-base italic sm:text-lg" title={title}>
          {title}
        </p>
        <button
          data-reader-control
          onClick={onToggleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark this page"}
          title={bookmarked ? "Remove bookmark" : "Bookmark this page"}
          className="pointer-events-auto grid size-9 place-items-center rounded-full transition-colors hover:bg-current/10"
        >
          <span
            className="block h-5 w-3.5"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
              background: bookmarked ? "var(--lamplight)" : "transparent",
              boxShadow: bookmarked ? "none" : "inset 0 0 0 1.5px currentColor",
              opacity: bookmarked ? 1 : 0.5,
            }}
          />
        </button>
      </div>

      {/* Footer — container is pass-through; only the interactive children capture clicks */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 px-4 pb-6 pt-10 sm:px-8 ${shell} pointer-events-none`}
      >
        <div className="flex items-center gap-4">
          <button
            data-reader-control
            onClick={onPrev}
            className={`pointer-events-auto ${button}`}
            aria-label="Previous page"
            disabled={page <= 1}
          >
            ‹
          </button>
          <span className="font-mono text-[11px] tracking-[0.2em] tabular-nums opacity-70">
            Page {page} / {total}
          </span>
          <button
            data-reader-control
            onClick={onNext}
            className={`pointer-events-auto ${button}`}
            aria-label="Next page"
            disabled={page >= total}
          >
            ›
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2" role="group" aria-label="Reading theme">
            {THEMES.map((option) => (
              <button
                key={option.id}
                data-reader-control
                onClick={() => onTheme(option.id)}
                title={option.label}
                aria-label={option.label}
                aria-pressed={theme === option.id}
                className="pointer-events-auto size-6 rounded-full border border-current/25 transition-transform hover:scale-105"
                style={{
                  background: option.swatch,
                  outline: theme === option.id ? "2px solid var(--lamplight)" : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
          <button
            data-reader-control
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className="pointer-events-auto rounded-full border border-current/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] opacity-70 transition-opacity hover:opacity-100"
          >
            Page sound {soundOn ? "on" : "off"}
          </button>
        </div>
      </div>
    </>
  );
}
