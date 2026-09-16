export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <span className="font-display text-xl font-semibold text-ink">folio</span>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Made for people who still love reading.
            </p>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink">
              About
            </a>
            <a href="#how-it-works" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink">
              Privacy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
