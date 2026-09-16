import { useRef, useState } from "react";

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

  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-ink/10 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Upload a book</p>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          PDF · stays on your device
        </span>
      </div>

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
        className={`mt-5 rounded-xl border border-dashed p-8 text-center transition-colors sm:p-10 ${
          dragging ? "border-lamplight bg-lamplight/10" : "border-ink/25 hover:border-lamplight/60 hover:bg-lamplight/5"
        }`}
      >
        <p className="font-display text-2xl italic text-ink">Drag &amp; drop your PDF here</p>
        <p className="mt-2 text-sm text-ink-soft">or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-lamplight disabled:opacity-60"
        >
          {busy ? "Preparing…" : "Upload a Book"}
          <span aria-hidden className="text-xs">
            ↗
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {fileName && status !== "error" ? (
        <div className="mt-6 border-t border-ink/10 pt-6">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="size-2 shrink-0 rounded-full bg-lamplight" />
              <span className="truncate font-medium">{fileName}</span>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-ink-soft">
              {status === "reading" ? `Reading · ${Math.round(progress * 100)}%` : "Opening the book…"}
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-lamplight transition-[width] duration-200"
              style={{ width: `${Math.max(6, progress * 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 border-t border-ink/10 pt-6 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
