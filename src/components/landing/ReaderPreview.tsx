export function ReaderPreview() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <h2 className="max-w-[20ch] text-balance font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight text-ink">
        Your book, without the document.
      </h2>

      <div className="mt-16 flex justify-center">
        {/* Mock book page */}
        <div
          className="relative w-full max-w-md rounded-sm p-8 sm:p-12"
          style={{
            background: "var(--paper)",
            boxShadow:
              "0 1px 0 oklch(1 0 0 / 30%) inset, 0 24px 50px -28px rgba(58,44,36,0.35), 0 8px 20px -14px rgba(58,44,36,0.25)",
            aspectRatio: "3 / 4",
          }}
        >
          {/* Bookmark indicator */}
          <div className="absolute right-8 top-0 h-10 w-4 bg-lamplight" style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
          }} />

          {/* Chapter title */}
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            Chapter Seven
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold italic text-ink">
            The Value of Patience
          </h3>

          {/* Body text lines */}
          <div className="mt-8 space-y-3">
            {[100, 95, 98, 92, 96, 88, 100, 94, 90, 85, 78].map((width, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-ink/8"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>

          {/* Page number */}
          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">47</span>
            <span className="size-1 rounded-full bg-ink-faint" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-ink-faint">312</span>
          </div>

          {/* Subtle controls mockup */}
          <div className="absolute -bottom-14 left-1/2 flex -translate-x-1/2 items-center gap-4">
            <span className="grid size-8 place-items-center rounded-full border border-hairline font-display text-sm text-ink-soft">‹</span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-ink-faint">PAGE 47 / 312</span>
            <span className="grid size-8 place-items-center rounded-full border border-hairline font-display text-sm text-ink-soft">›</span>
          </div>
        </div>
      </div>
    </section>
  );
}
