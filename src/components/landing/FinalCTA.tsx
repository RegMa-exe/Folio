type Props = {
  onUploadClick: () => void;
};

export function FinalCTA({ onUploadClick }: Props) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <div className="flex flex-col items-center text-center">
        <h2 className="max-w-[20ch] text-balance font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight text-ink">
          Your next book is already waiting.
        </h2>
        <p className="mt-6 max-w-[40ch] text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
          Upload a PDF and start reading.
        </p>
        <button
          onClick={onUploadClick}
          className="mt-10 rounded-full bg-ink px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-all hover:bg-lamplight hover:shadow-lg"
        >
          Upload a Book
        </button>
      </div>
    </section>
  );
}
