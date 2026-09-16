import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

type Props = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  /** Max pixel box the sheet may occupy. */
  maxWidth: number;
  maxHeight: number;
  onAspect?: (aspect: number) => void;
};

/** Renders a single PDF page onto a canvas sized to fit the reading area. */
export function BookPage({ doc, pageNumber, maxWidth, maxHeight, onAspect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderTask: { cancel: () => void } | null = null;
    setReady(false);
    setFailed(false);

    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        const aspect = base.width / base.height;
        onAspect?.(aspect);

        const boxWidth = Math.min(maxWidth, maxHeight * aspect);
        const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 2);
        const scale = (boxWidth / base.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        const context = canvas.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({ canvas, canvasContext: context, viewport });
        await (renderTask as unknown as { promise: Promise<void> }).promise;
        if (!cancelled) setReady(true);
      } catch (error) {
        if (!cancelled && (error as Error)?.name !== "RenderingCancelledException") {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [doc, pageNumber, maxWidth, maxHeight, onAspect]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        aria-label={`Page ${pageNumber}`}
        className="block w-full rounded-[3px]"
        style={{ filter: "var(--page-filter)", opacity: ready ? 1 : 0, transition: "opacity 180ms ease" }}
      />
      {!ready && !failed ? (
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            Setting the page
          </span>
        </div>
      ) : null}
      {failed ? (
        <div className="absolute inset-0 grid place-items-center px-8 text-center">
          <p className="font-display text-xl italic" style={{ color: "var(--room-ink-soft)" }}>
            This page could not be rendered.
          </p>
        </div>
      ) : null}
    </div>
  );
}
