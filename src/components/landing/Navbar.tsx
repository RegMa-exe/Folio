import { useState } from "react";
import { Menu, X } from "lucide-react";

type Props = {
  onUploadClick: () => void;
};

export function Navbar({ onUploadClick }: Props) {
  const [open, setOpen] = useState(false);

  const navLink =
    "font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink";

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
      <a href="#top" className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold tracking-tight text-ink">folio</span>
      </a>

      <nav className="hidden items-center gap-10 sm:flex">
        <a href="#how-it-works" className={navLink}>
          How it works
        </a>
        <a href="#features" className={navLink}>
          Features
        </a>
        <button
          onClick={onUploadClick}
          className="rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-colors hover:bg-lamplight"
        >
          Upload Book
        </button>
      </nav>

      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X className="size-5 text-ink" /> : <Menu className="size-5 text-ink" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mx-4 mt-2 rounded-lg border border-hairline bg-paper p-6 shadow-lg sm:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#how-it-works" onClick={() => setOpen(false)} className={navLink}>
              How it works
            </a>
            <a href="#features" onClick={() => setOpen(false)} className={navLink}>
              Features
            </a>
            <button
              onClick={() => {
                setOpen(false);
                onUploadClick();
              }}
              className="rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper transition-colors hover:bg-lamplight"
            >
              Upload Book
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
