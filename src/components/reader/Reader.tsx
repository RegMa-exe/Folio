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

  // cursor zone state: "left" | "right" | null, plus edge intensity 0..1
  const [cursorZone, setCursorZone] = useState<"left" | "right" | null>(null);
  const [edgeIntensity, setEdgeIntensity] = useState(0);

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

  // measure the reading area — use the full viewport
  useEffect(() => {
    const update = () => {
      setBox({
        width: Math.max(240, window.innerWidth),
        height: Math.max(320, window.innerHeight),
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = event.changedTouches[0];
    if (!start || !t) return;
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

  // ── Sizing: target ~90vh, preserve aspect ratio, cap max width ──
  // Reserve ~10vh for top/bottom UI
  const targetHeight = box.height * 0.9;
  const maxSheetWidth = Math.min(box.width * 0.94, targetHeight * aspect, 1100);
  const sheetWidth = Math.max(200, maxSheetWidth);

  // ── Cursor zone tracking ──
  const onStageMouseMove = useCallback(
    (event: React.MouseEvent) => {
      revealControls();
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = event.clientX - rect.left;
      const half = rect.width / 2;
      if (x < half) {
        setCursorZone("left");
        // intensity: 0 at center, 1 at left edge
        setEdgeIntensity(1 - x / half);
      } else {
        setCursorZone("right");
        // intensity: 0 at center, 1 at right edge
        setEdgeIntensity((x - half) / half);
      }
    },
    [revealControls],
  );

  const onStageMouseLeave = useCallback(() => {
    setCursorZone(null);
    setEdgeIntensity(0);
  }, []);

  // ── Click handler for the full viewport ──
  const onStageClick = useCallback(
    (event: React.MouseEvent) => {
      // If the click target is inside a UI control, skip navigation
      const target = event.target as HTMLElement;
      if (target.closest("[data-reader-control]")) return;

      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = event.clientX - rect.left;
      if (x < rect.width / 2) {
        go("prev");
      } else {
        go("next");
      }
      revealControls();
    },
    [go, revealControls],
  );

  const arrowOpacity = Math.min(0.7, 0.15 + edgeIntensity * 0.55);

  return (
    <div
      data-reading-theme={theme}
      className="fixed inset-0 z-40 overflow-hidden"
      style={{ background: "var(--room)", color: "var(--room-ink)" }}
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
        className="relative h-full w-full"
        onMouseMove={onStageMouseMove}
        onMouseLeave={onStageMouseLeave}
        onClick={onStageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          perspective: "2200px",
          cursor: cursorZone === "left" ? "w-resize" : cursorZone === "right" ? "e-resize" : "default",
        }}
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
                maxHeight={targetHeight}
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
          </div>
        </div>

        {/* Cursor affordance arrows */}
        {cursorZone === "left" && (
          <div
            className="pointer-events-none fixed left-8 top-1/2 -translate-y-1/2 font-display text-5xl"
            style={{
              opacity: arrowOpacity,
              color: "var(--room-ink)",
              transition: "opacity 120ms ease",
            }}
          >
            ←
          </div>
        )}
        {cursorZone === "right" && (
          <div
            className="pointer-events-none fixed right-8 top-1/2 -translate-y-1/2 font-display text-5xl"
            style={{
              opacity: arrowOpacity,
              color: "var(--room-ink)",
              transition: "opacity 120ms ease",
            }}
          >
            →
          </div>
        )}
      </div>
    </div>
  );
}
