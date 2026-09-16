import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { UploadPanel } from "@/components/UploadPanel";
import { Reader } from "@/components/reader/Reader";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { ReaderPreview } from "@/components/landing/ReaderPreview";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { loadPdf } from "@/lib/pdf";
import { bookKey } from "@/lib/reading-storage";
import { cleanTitle } from "@/lib/title";
import { FileText, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "folio — Read your digital books like books" },
      {
        name: "description",
        content:
          "Turn a PDF into an immersive, book-like reading experience: one page at a time, real page turns, warm paper themes. Nothing leaves your device.",
      },
      { property: "og:title", content: "folio — Read your digital books like books" },
      {
        property: "og:description",
        content: "Turn your PDF into an immersive, book-like reading experience.",
      },
    ],
  }),
  component: Home,
});

type Status = "idle" | "reading" | "processing" | "error";

type LoadedBook = {
  doc: PDFDocumentProxy;
  title: string;
  key: string;
};

function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedBook, setLoadedBook] = useState<LoadedBook | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);

  const openFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);
    setLoadedBook(null);

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
      const title = cleanTitle(file.name);
      setLoadedBook({ doc, title, key: bookKey(file.name, file.size, doc.numPages) });
      setStatus("idle");
      setProgress(1);
    } catch {
      setStatus("error");
      setError("This PDF couldn't be opened. It may be damaged or password protected.");
    }
  }, []);

  const scrollToUpload = useCallback(() => {
    setShowUpload(true);
    requestAnimationFrame(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  // ── Reader mode ──
  if (loadedBook && isReading) {
    return (
      <Reader
        doc={loadedBook.doc}
        title={loadedBook.title}
        storageKey={loadedBook.key}
        onExit={() => {
          setIsReading(false);
        }}
      />
    );
  }

  const showPreview = loadedBook && status === "idle" && progress === 1;

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper-deep text-ink">
      {/* Subtle warm ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(60% 50%, color-mix(in oklab, var(--lamplight) 6%, transparent), transparent 70%)",
          }}
        />
      </div>

      <Navbar onUploadClick={scrollToUpload} />

      <Hero onUploadClick={scrollToUpload} />

      {/* Upload area — revealed when user clicks "Upload a Book" */}
      {showUpload && (
        <div ref={uploadRef} className="relative z-10 mx-auto -mt-4 max-w-5xl px-6 pb-12 sm:px-8">
          {showPreview && loadedBook ? (
            <div
              className="mx-auto flex max-w-2xl flex-col items-center rounded-sm border border-hairline p-10 text-center sm:p-16"
              style={{ background: "var(--paper)" }}
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-paper-deep">
                <FileText className="size-7 text-lamplight" />
              </div>
              <h3
                className="mt-6 text-balance font-display text-2xl font-semibold italic leading-tight text-ink sm:text-3xl"
                style={{ maxWidth: "600px" }}
              >
                {loadedBook.title}
              </h3>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                {loadedBook.doc.numPages} pages
              </p>
              <button
                onClick={() => setIsReading(true)}
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-all hover:bg-lamplight hover:shadow-lg"
              >
                <BookOpen className="size-3.5" />
                Start Reading
              </button>
            </div>
          ) : (
            <UploadPanel
              onFile={openFile}
              status={status}
              progress={progress}
              fileName={fileName}
              error={error}
            />
          )}
        </div>
      )}

      <HowItWorks />
      <Features />
      <ReaderPreview />
      <FinalCTA onUploadClick={scrollToUpload} />
      <Footer />
    </main>
  );
}
