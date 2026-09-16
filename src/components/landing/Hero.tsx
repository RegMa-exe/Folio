import { ImageStreamHero } from "@/components/ui/image-stream-hero";

type Props = {
  onUploadClick: () => void;
};

export function Hero({ onUploadClick }: Props) {
  return (
    <section id="top" className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
      <div className="relative z-10 flex flex-col items-center pt-8 text-center sm:pt-12">
        <p className="animate-rise font-mono text-[10px] uppercase tracking-[0.35em] text-lamplight">
          The Digital Reading Experience
        </p>

        <h1
          className="animate-rise mt-6 text-balance font-display text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-tight text-ink [animation-delay:80ms]"
        >
          Read your digital books.
          <br />
          <span className="italic text-ink-soft">Like a book.</span>
        </h1>

        <p className="animate-rise mt-8 max-w-[48ch] text-pretty text-base leading-relaxed text-ink-soft sm:text-lg [animation-delay:160ms]">
          Turn your PDFs into a beautiful, immersive reading experience designed to feel less like a
          document and more like a book.
        </p>

        <div className="animate-rise mt-10 flex flex-col items-center gap-4 sm:flex-row [animation-delay:240ms]">
          <button
            onClick={onUploadClick}
            className="rounded-full bg-ink px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-all hover:bg-lamplight hover:shadow-lg"
          >
            Upload a Book
          </button>
          <a
            href="#how-it-works"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-soft transition-colors hover:text-ink"
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Image corridor — large, sits below headline, subtle */}
      <div className="animate-rise relative mt-12 h-[clamp(200px,32vw,380px)] w-full [animation-delay:320ms]">
        <ImageStreamHero className="h-full w-full" />
      </div>
    </section>
  );
}
