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

const DRAG_THRESHOLD = 60;
const ZOOM_MIN = 75;
const ZOOM_MAX = 250;
const ZOOM_DEFAULT = 100;

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
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // cursor zone state
  const [cursorZone, setCursorZone] = useState<"left" | "right" | null>(null);
  const [edgeIntensity, setEdgeIntensity] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnId = useRef(0);

  // drag state (mouse + touch unified)
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    setTheme(loadTheme());
    setSoundOn(loadSound());
  }, []);

  useEffect(() => {
    saveBookState(storageKey, { page, bookmarks });
  }, [storageKey, page, bookmarks]);

  // measure the reading area
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

  // ── Unified page change ──
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

  const nextPage = useCallback(() => go("next"), [go]);
  const prevPage = useCallback(() => go("prev"), [go]);

  // ── Keyboard ──
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        nextPage();
        revealControls();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        prevPage();
        revealControls();
      } else if (event.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextPage, prevPage, onExit, revealControls]);

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
        setEdgeIntensity(1 - x / half);
      } else {
        setCursorZone("right");
        setEdgeIntensity((x - half) / half);
      }
    },
    [revealControls],
  );

  const onStageMouseLeave = useCallback(() => {
    setCursorZone(null);
    setEdgeIntensity(0);
  }, []);

  // ── Unified pointer start (mouse + touch) ──
  const onPointerDown = useCallback(
    (clientX: number, clientY: number, target: HTMLElement) => {
      if (target.closest("[data-reader-control]")) return;
      dragStart.current = { x: clientX, y: clientY };
      isDragging.current = false;
      // When zoomed in, start a pan gesture
      if (zoom > ZOOM_DEFAULT) {
        panStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y };
      }
    },
    [zoom, pan],
  );

  // ── Unified pointer move (for panning when zoomed) ──
  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!panStart.current || zoom <= ZOOM_DEFAULT) return;
      const dx = clientX - panStart.current.x;
      const dy = clientY - panStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
    },
    [zoom],
  );

  // ── Unified pointer end (mouse + touch) ──
  const onPointerEnd = useCallback(
    (clientX: number, clientY: number) => {
      const start = dragStart.current;
      dragStart.current = null;
      panStart.current = null;

      if (!start) return;

      const dx = clientX - start.x;
      const dy = clientY - start.y;

      // If panning was active, don't trigger page navigation
      if (zoom > ZOOM_DEFAULT && isDragging.current) {
        revealControls();
        return;
      }

      // If it was a drag beyond threshold
      if (Math.abs(dx) > DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
        go(dx < 0 ? "next" : "prev");
        revealControls();
        return;
      }

      // If it was a click (not a drag), use zone-based navigation
      if (!isDragging.current && Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = clientX - rect.left;
        if (x < rect.width / 2) {
          prevPage();
        } else {
          nextPage();
        }
        revealControls();
      }
    },
    [go, nextPage, prevPage, revealControls, zoom],
  );

  // ── Mouse handlers ──
  const onStageMouseDown = useCallback(
    (event: React.MouseEvent) => {
      onPointerDown(event.clientX, event.clientY, event.target as HTMLElement);
    },
    [onPointerDown],
  );

  const onStageMouseMovePan = useCallback(
    (event: React.MouseEvent) => {
      onPointerMove(event.clientX, event.clientY);
    },
    [onPointerMove],
  );

  const onStageMouseUp = useCallback(
    (event: React.MouseEvent) => {
      onPointerEnd(event.clientX, event.clientY);
    },
    [onPointerEnd],
  );

  // ── Touch handlers ──
  const onTouchStart = (event: React.TouchEvent) => {
    const t = event.touches[0];
    if (!t) return;
    onPointerDown(t.clientX, t.clientY, event.target as HTMLElement);
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const t = event.changedTouches[0];
    if (!t) return;
    onPointerEnd(t.clientX, t.clientY);
  };

  const toggleBookmark = () => {
    setBookmarks((current) =>
      current.includes(page) ? current.filter((value) => value !== page) : [...current, page].sort((a, b) => a - b),
    );
    revealControls();
  };

  // ── Sizing: target ~86vh for book area, reserve space for HUD ──
  // Top bar ~56px, bottom controls ~100px, so reserve ~160px total
  const hudReserve = 160;
  const availableHeight = box.height - hudReserve;
  const targetHeight = availableHeight * 0.96;
  const maxSheetWidth = Math.min(box.width * 0.92, targetHeight * aspect, 1100);
  const sheetWidth = Math.max(200, maxSheetWidth);
  const zoomScale = zoom / 100;

  const arrowOpacity = Math.min(0.6, 0.12 + edgeIntensity * 0.48);

  return (
    <div
      data-reading-theme={theme}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{ background: "var(--room)", color: "var(--room-ink)" }}
    >
      <div className="lamp-glow pointer-events-none absolute inset-0" />

      {/* ── Top bar (dedicated space) ── */}
      <ReaderControls
        visible={controlsVisible}
        title={title}
        page={page}
        total={total}
        bookmarked={bookmarks.includes(page)}
        soundOn={soundOn}
        theme={theme}
        onPrev={() => { prevPage(); revealControls(); }}
        onNext={() => { nextPage(); revealControls(); }}
        zoom={zoom}
        onZoomChange={(z) => {
          setZoom(z);
          if (z === ZOOM_DEFAULT) setPan({ x: 0, y: 0 });
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

      {/* ── Book page area (flex-1, centered, no overlap) ── */}
      <div
        ref={stageRef}
        className="relative flex-1 overflow-hidden"
        onMouseMove={(e) => { onStageMouseMove(e); onStageMouseMovePan(e); }}
        onMouseLeave={onStageMouseLeave}
        onMouseDown={onStageMouseDown}
        onMouseUp={onStageMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={(e) => { const t = e.touches[0]; if (t) onPointerMove(t.clientX, t.clientY); }}
        onTouchEnd={onTouchEnd}
        style={{
          perspective: "2200px",
          cursor: zoomScale > 1 ? "grab" : cursorZone === "left" ? "w-resize" : cursorZone === "right" ? "e-resize" : "default",
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
              style={{
                transform: `scale(${zoomScale}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: "center center",
                transition: turn ? undefined : "transform 80ms ease-out",
              }}
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
            className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 font-display text-4xl sm:text-5xl"
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
            className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 font-display text-4xl sm:text-5xl"
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
