import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { UploadPanel } from "@/components/UploadPanel";
import { Reader } from "@/components/reader/Reader";
import { loadPdf } from "@/lib/pdf";
import { bookKey } from "@/lib/reading-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BookFlow — Read your digital books like books" },
      {
        name: "description",
        content:
          "Turn a PDF into an immersive, book-like reading experience: one page at a time, real page turns, warm paper themes. Nothing leaves your device.",
      },
      { property: "og:title", content: "BookFlow — Read your digital books like books" },
      {
        property: "og:description",
        content: "Turn your PDF into an immersive, book-like reading experience.",
      },
    ],
  }),
  component: Home,
});

type Status = "idle" | "reading" | "processing" | "error";

function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [book, setBook] = useState<{ doc: PDFDocumentProxy; title: string; key: string } | null>(null);

  const openFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("error");
      setError("That file isn't a PDF. Choose a PDF book to start reading.");
      return;
    }

    try {
      setStatus("reading");
      setProgress(0.05);
      const data = await file.arrayBuffer();
      setProgress(0.4);
      setStatus("processing");
      const doc = await loadPdf(data, (ratio) => setProgress(0.4 + ratio * 0.6));
      const title = file.name.replace(/\.pdf$/i, "");
      setBook({ doc, title, key: bookKey(file.name, file.size, doc.numPages) });
      setStatus("idle");
      setProgress(1);
    } catch {
      setStatus("error");
      setError("This PDF couldn't be opened. It may be damaged or password protected.");
    }
  }, []);

  if (book) {
    return (
      <Reader
        doc={book.doc}
        title={book.title}
        storageKey={book.key}
        onExit={() => {
          setBook(null);
          setStatus("idle");
          setProgress(0);
          setFileName(null);
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-lamplight/10 blur-3xl" />
        <div className="absolute bottom-0 -right-24 h-80 w-80 rounded-full bg-lamplight-soft/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-5xl items-baseline gap-2 px-6 py-6 sm:px-8">
        <span className="font-display text-2xl font-semibold tracking-tight">BookFlow</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">Reader</span>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-10 sm:px-8 sm:pt-14">
        <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.3em] text-lamplight">
          A quiet place to read
        </p>
        <h1 className="animate-rise mt-6 text-balance font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-tight [animation-delay:80ms]">
          Read your digital books
          <br className="hidden sm:block" />
          <span className="italic text-ink-soft"> like books.</span>
        </h1>
        <p className="animate-rise mt-8 max-w-[44ch] text-pretty text-lg leading-relaxed text-ink-soft [animation-delay:160ms]">
          Turn your PDF into an immersive, book-like reading experience. One page at a time, under a
          single warm lamp.
        </p>

        <div className="animate-rise mt-14 max-w-xl [animation-delay:240ms]">
          <UploadPanel
            onFile={openFile}
            status={status}
            progress={progress}
            fileName={fileName}
            error={error}
          />
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink/10 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          <span>Click the edges or swipe to turn</span>
          <span className="size-1 rounded-full bg-lamplight" />
          <span>Four paper themes</span>
          <span className="size-1 rounded-full bg-lamplight" />
          <span>No account, no cloud</span>
        </div>
      </div>
    </main>
  );
}
