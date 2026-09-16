import { MousePointerClick, BookOpen, Volume2, Eye } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <h2 className="max-w-[20ch] text-balance font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight text-ink">
        PDFs give you the book.
        <br />
        <span className="italic text-ink-soft">We give you the experience.</span>
      </h2>

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-20">
        {/* Traditional PDF */}
        <div className="relative md:border-r md:border-hairline md:pr-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            Traditional PDF viewer
          </p>
          <div className="mt-6 space-y-5 border-l border-hairline pl-6">
            {[
              { icon: MousePointerClick, label: "Scrolling through pages" },
              { icon: Eye, label: "Zooming in and out" },
              { icon: BookOpen, label: "Document interface" },
              { icon: Volume2, label: "Screen-like experience" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 text-ink-soft">
                <Icon className="size-4 shrink-0 text-ink-faint" />
                <span className="text-base">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Our reader */}
        <div className="relative md:pl-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-lamplight">
            The folio reader
          </p>
          <div className="mt-6 space-y-5 border-l-2 border-lamplight pl-6">
            {[
              { icon: BookOpen, label: "Page-by-page reading" },
              { icon: MousePointerClick, label: "Book-like interaction" },
              { icon: Eye, label: "Immersive presentation" },
              { icon: Volume2, label: "Distraction-free environment" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 text-ink">
                <Icon className="size-4 shrink-0 text-lamplight" />
                <span className="font-display text-lg italic">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
