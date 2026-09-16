import type { PDFDocumentProxy } from "pdfjs-dist";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function loadPdf(
  data: ArrayBuffer,
  onProgress?: (ratio: number) => void,
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfjs();
  const task = pdfjs.getDocument({ data });
  task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) onProgress?.(Math.min(1, loaded / total));
  };
  return task.promise;
}

export type { PDFDocumentProxy };
