import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { cleanTitle } from "@/lib/title";

type Props = {
  onFile: (file: File) => void;
  status: "idle" | "reading" | "processing" | "error";
  progress: number;
  fileName: string | null;
  error: string | null;
};

export function UploadPanel({ onFile, status, progress, fileName, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const busy = status === "reading" || status === "processing";

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFile(file);
  };

  const displayTitle = fileName ? cleanTitle(fileName) : null;

  return (
    <div className="w-full max-w-xl">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className="relative rounded-sm border-2 border-dashed p-10 text-center transition-all sm:p-14"
        style={{
          borderColor: dragging ? "var(--lamplight)" : "var(--hairline)",
          background: dragging ? "color-mix(in oklab, var(--lamplight) 5%, transparent)" : "var(--paper)",
        }}
      >
        <div className="relative">
          <p className="font-display text-3xl font-semibold italic text-ink sm:text-4xl">
            Bring your book.
          </p>
          <p className="mt-4 text-base text-ink-soft">
            Drop a PDF here or choose a file from your device.
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-paper transition-all hover:bg-lamplight disabled:opacity-50"
          >
            <Upload className="size-3.5" />
            {busy ? "Preparing…" : "Choose PDF"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => handleFiles(event.target.files)}
          />

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            PDF · Stays on your device
          </p>
        </div>
      </div>

      {/* Processing / loading state */}
      {displayTitle && status !== "error" && status !== "idle" && (
        <div className="mt-6 border-t border-hairline pt-6">
          <div className="flex items-center gap-3">
            <FileText className="size-4 shrink-0 text-lamplight" />
            <span className="line-clamp-2 font-display text-lg italic text-ink">{displayTitle}</span>
          </div>
          <div className="mt-4 h-px overflow-hidden bg-hairline">
            <div
              className="h-full bg-lamplight transition-[width] duration-200"
              style={{ width: `${Math.max(6, progress * 100)}%` }}
            />
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            {status === "reading" ? `Reading · ${Math.round(progress * 100)}%` : "Opening the book…"}
          </p>
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="mt-6 border-t border-hairline pt-6">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        </div>
      ) : null}
    </div>
  );
}
