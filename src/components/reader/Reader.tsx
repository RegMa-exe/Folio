import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { BookPage } from "./BookPage";
import { ReaderControls } from "./ReaderControls";
import { playPageTurn } from "@/lib/page-sound";
import {
  loadBookState,
  loadSound,
  loadTheme,
  saveBookState,
  saveSound,
  saveTheme,
  type ReadingTheme,
} from "@/lib/reading-storage";

type Props = {
  doc: PDFDocumentProxy;
  title: string;
  storageKey: string;
  onExit: () => void;
};

export function Reader({ doc, title, storageKey, onExit }: Props) {
  const total = doc.numPages;
  const initial = loadBookState(storageKey);

  const [page, setPage] = useState(() => Math.min(Math.max(initial.page, 1), total));
  const [bookmarks, setBookmarks] = useState<number[]>(initial.bookmarks);
  const [theme, setTheme] = useState<ReadingTheme>("classic");
  const [soundOn, setSoundOn] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [turn, setTurn] = useState<{ dir: "next" | "prev"; id: number } | null>(null);
  const [box, setBox] = useState({ width: 720, height: 900 });
  const [aspect, setAspect] = useState(0.72);

  const stageRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnId = useRef(0);

  useEffect(() => {
    setTheme(loadTheme());
    setSoundOn(loadSound());
  }, []);

  useEffect(() => {
    saveBookState(storageKey, { page, bookmarks });
  }, [storageKey, page, bookmarks]);

  // measure the reading area
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ width: Math.max(240, width), height: Math.max(320, height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2600);
  }, []);

  useEffect(() => {
    revealControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [revealControls]);

  const go = useCallback(
    (dir: "next" | "prev") => {
      setPage((current) => {
        const target = dir === "next" ? current + 1 : current - 1;
        if (target < 1 || target > total) return current;
        turnId.current += 1;
        setTurn({ dir, id: turnId.current });
        if (soundOn) playPageTurn();
        return target;
      });
    },
    [soundOn, total],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        go("next");
        revealControls();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go("prev");
        revealControls();
      } else if (event.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onExit, revealControls]);

  // swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    const t = event.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(dx < 0 ? "next" : "prev");
      revealControls();
    }
  };

  const toggleBookmark = () => {
    setBookmarks((current) =>
      current.includes(page) ? current.filter((value) => value !== page) : [...current, page].sort((a, b) => a - b),
    );
    revealControls();
  };

  const sheetWidth = Math.min(box.width, box.height * aspect);

  return (
    <div
      data-reading-theme={theme}
      className="fixed inset-0 z-40 overflow-hidden"
      style={{ background: "var(--room)", color: "var(--room-ink)" }}
      onMouseMove={revealControls}
    >
      <div className="lamp-glow pointer-events-none absolute inset-0" />

      <ReaderControls
        visible={controlsVisible}
        title={title}
        page={page}
        total={total}
        bookmarked={bookmarks.includes(page)}
        soundOn={soundOn}
        theme={theme}
        onPrev={() => {
          go("prev");
          revealControls();
        }}
        onNext={() => {
          go("next");
          revealControls();
        }}
        onToggleBookmark={toggleBookmark}
        onToggleSound={() => {
          setSoundOn((on) => {
            saveSound(!on);
            if (!on) playPageTurn();
            return !on;
          });
          revealControls();
        }}
        onTheme={(next) => {
          setTheme(next);
          saveTheme(next);
          revealControls();
        }}
        onExit={onExit}
      />

      <div
        ref={stageRef}
        className="relative h-full w-full px-4 py-16 sm:px-14 sm:py-20"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ perspective: "2200px" }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative" style={{ width: sheetWidth }}>
            {/* pages resting underneath */}
            <div
              aria-hidden
              className="absolute inset-x-2 -bottom-2 top-2 rounded-[4px]"
              style={{ background: "var(--page)", opacity: 0.5 }}
            />
            <div
              aria-hidden
              className="absolute inset-x-1 -bottom-1 top-1 rounded-[4px]"
              style={{ background: "var(--page)", opacity: 0.75 }}
            />

            <div
              key={turn?.id ?? "first"}
              className={`page-sheet relative rounded-[4px] p-2 sm:p-3 ${
                turn ? (turn.dir === "next" ? "turning-next" : "turning-prev") : ""
              }`}
            >
              <BookPage
                doc={doc}
                pageNumber={page}
                maxWidth={sheetWidth}
                maxHeight={box.height}
                onAspect={setAspect}
              />
              {bookmarks.includes(page) ? (
                <span
                  aria-hidden
                  className="absolute -top-1 right-6 h-10 w-4"
                  style={{
                    background: "var(--lamplight)",
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
                  }}
                />
              ) : null}
            </div>

            {/* edge tap zones */}
            <button
              className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
              aria-label="Previous page"
              onClick={() => {
                go("prev");
                revealControls();
              }}
            />
            <button
              className="absolute inset-y-0 left-1/3 w-1/3"
              aria-label="Show reading controls"
              onClick={revealControls}
            />
            <button
              className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize"
              aria-label="Next page"
              onClick={() => {
                go("next");
                revealControls();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
