'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FocusTrap } from 'focus-trap-react';

import { type DoodleWallPhase, useSceneStore } from '@/store/scene';
import { EASE } from '@/lib/motion';
import { useKeyDown } from '@/hooks/useKeyDown';
import {
  BRUSH_SIZES,
  DRAWING_CANVAS_SIZE,
  GRID_COLS,
  INK_PALETTE,
  STORED_TILE_SIZE,
  SUBMIT_BURST_PER_MINUTE,
  SUBMIT_DAILY_CAP,
  SUBMIT_FEEDBACK_MIN_MS,
  TILE_GROUND,
  TILE_MAX_BYTES,
  UNDO_DEPTH,
  WALL_TILE_COUNT,
  type WallTile,
} from '@/components/three/game/doodleWallConfig';

// NB: no @react-three/* imports — static bundle (doodleWallConfig is three-free).

/**
 * DoodleWallHud — the doodle wall's step-in overlay (DOM sibling of the other
 * HUDs). Shows BOTH halves of the wall: every approved tile from GET /api/wall
 * as an <img> grid, and the drawing surface — a 512×512 <canvas> exported as a
 * 256×256 PNG and POSTed to /api/tiles into the pre-moderation queue.
 *
 * Active two ways:
 *  - step-in: `mode === 'playing' && activeStall === 'doodle-wall'` (Full AND
 *    Lite — no quality gate, unlike ball-toss);
 *  - the `#doodle-wall` link from StaticCv — the overlay is the wall's home on
 *    the no-canvas tier (reduced motion / no WebGL), so it opens straight into
 *    the wall view without the scene.
 *
 * Per-stroke state lives in refs (stroke list + a baked base past UNDO_DEPTH);
 * only summaries touch React state / the store. Tools per the 2026-07-14 grill:
 * fixed near-black tile ground, six neon inks, three brushes, undo (20), clear
 * — no eraser, no text tool. Touch and pointer are both first-class (pointer
 * events + touch-action: none). `<WallView>` remounts per visit, so every stay
 * starts from a fresh tile ground without effect-driven state resets.
 */

interface Stroke {
  hex: string;
  size: number;
  /** Flat x,y pairs in canvas pixels. */
  pts: number[];
}

type ErrorKind = 'rate-limited' | 'failed';

const CANVAS = DRAWING_CANVAS_SIZE;

/* --- #doodle-wall hash as an external store (the StaticCv link's switch) --- */
function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}
const readHashOpen = () => window.location.hash === '#doodle-wall';
const readHashOpenServer = () => false;

function paintGround(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = TILE_GROUND;
  ctx.fillRect(0, 0, CANVAS, CANVAS);
}

function paintStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.strokeStyle = s.hex;
  ctx.lineWidth = s.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(s.pts[0], s.pts[1]);
  if (s.pts.length === 2) ctx.lineTo(s.pts[0] + 0.01, s.pts[1]); // a tap = a dot
  for (let i = 2; i < s.pts.length; i += 2) ctx.lineTo(s.pts[i], s.pts[i + 1]);
  ctx.stroke();
}

/** The shared letterpress card chrome (backdrop + dialog frame). */
function CardShell({ children }: { children: ReactNode }) {
  return (
    <FocusTrap
      focusTrapOptions={{
        initialFocus: false,
        escapeDeactivates: false,
        allowOutsideClick: true,
      }}
    >
      <motion.div
        className="pointer-events-auto absolute inset-0 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="absolute inset-0 bg-background-primary/55 backdrop-blur-[2px]" />
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.99 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="ticket-frame halftone relative z-10 w-full max-w-md rounded-[5px] p-6 text-center md:p-8"
        >
          {children}
        </motion.div>
      </motion.div>
    </FocusTrap>
  );
}

export function DoodleWallHud() {
  const storeActive = useSceneStore((s) => s.mode === 'playing' && s.activeStall === 'doodle-wall');
  const phase = useSceneStore((s) => s.doodleWallPhase);
  const setPhase = useSceneStore((s) => s.setDoodleWallPhase);
  const exit = useSceneStore((s) => s.exit);

  // The wall's no-canvas home: StaticCv links here with #doodle-wall, so
  // reduced-motion / no-WebGL visitors reach the wall without the scene.
  const linkOpen = useSyncExternalStore(subscribeToHash, readHashOpen, readHashOpenServer);
  useEffect(() => {
    // No scene to step in from — a link visit opens straight into the wall view.
    if (linkOpen) useSceneStore.getState().setDoodleWallPhase('drawing');
  }, [linkOpen]);

  const active = storeActive || linkOpen;
  const panelUp = active && phase !== 'intro';

  const exitAll = useCallback(() => {
    if (readHashOpen()) {
      // drop the hash without adding a history entry, then let the hash
      // subscribers re-read it (replaceState doesn't fire hashchange itself)
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    if (useSceneStore.getState().activeStall === 'doodle-wall') exit();
  }, [exit]);

  useKeyDown((e) => {
    if (e.key === 'Escape') exitAll();
  }, active);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Exit ✕ takes the burger's exact slot (h-10 w-10, top-3 right-4),
              matching the other HUDs. */}
          <button
            onClick={exitAll}
            aria-label="Leave the doodle wall"
            className="paper-button pointer-events-auto absolute right-4 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-[4px] font-rye text-[15px]"
          >
            ✕
          </button>

          {/* The wall view remounts per visit — fresh tile ground every stay. */}
          {panelUp && <WallView exitAll={exitAll} phase={phase} setPhase={setPhase} />}

          {/* How-it-works card (step-in intro; the wall view isn't up yet). */}
          <AnimatePresence>
            {phase === 'intro' && (
              <CardShell>
                <p className="font-fell-sc text-[13px] tracking-[0.22em] text-brass-text">
                  Leave your mark
                </p>
                <h2 className="font-rye letterpress mt-2 text-[34px] text-ink">Doodle Wall</h2>
                <p className="font-fell mt-4 text-[15px] leading-relaxed text-ink/90">
                  Every tile on this wall was drawn by a visitor. Pick a neon ink, doodle your own,
                  and hand it to the carny — once it&apos;s approved, it hangs here for everyone who
                  wanders past.
                </p>
                <button
                  onClick={() => setPhase('drawing')}
                  className="paper-button mt-6 rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
                >
                  Start drawing
                </button>
              </CardShell>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * WallView — the drawing surface + the full approved wall, plus the submitted /
 * error cards (they need the drawing to survive behind them). All per-stroke
 * state lives here so a remount gives a clean slate.
 */
function WallView({
  exitAll,
  phase,
  setPhase,
}: {
  exitAll: () => void;
  phase: DoodleWallPhase;
  setPhase: (p: DoodleWallPhase) => void;
}) {
  // --- The approved wall (all 48) — fetched fresh each visit ---
  const [wall, setWall] = useState<WallTile[]>([]);
  useEffect(() => {
    let live = true;
    fetch('/api/wall')
      .then((r) => (r.ok ? (r.json() as Promise<{ tiles: WallTile[] }>) : null))
      .then((data) => {
        if (live && data) setWall(data.tiles.slice(0, WALL_TILE_COUNT));
      })
      .catch(() => {
        /* the wall grid just stays empty; drawing still works */
      });
    return () => {
      live = false;
    };
  }, []);

  // --- Drawing state: strokes in refs, summaries in React state ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const bakedRef = useRef<ImageData | null>(null);
  const liveStrokeRef = useRef<Stroke | null>(null);
  const [inkIndex, setInkIndex] = useState(0);
  const [brushIndex, setBrushIndex] = useState(1);
  const [strokeCount, setStrokeCount] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [errorKind, setErrorKind] = useState<ErrorKind>('failed');

  const getCtx = useCallback(
    () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null,
    [],
  );

  // Paint the tile ground once on mount (external system, no state involved).
  useEffect(() => {
    const ctx = getCtx();
    if (ctx) paintGround(ctx);
  }, [getCtx]);

  const redraw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    paintGround(ctx);
    if (bakedRef.current) ctx.putImageData(bakedRef.current, 0, 0);
    for (const s of strokesRef.current) paintStroke(ctx, s);
  }, [getCtx]);

  /** Event-handler only (never from an effect): wipe back to the bare ground. */
  const resetCanvas = () => {
    strokesRef.current = [];
    bakedRef.current = null;
    liveStrokeRef.current = null;
    redraw();
    setStrokeCount(0);
    setDirty(false);
  };

  const toCanvasXY = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) / rect.width) * CANVAS,
      ((e.clientY - rect.top) / rect.height) * CANVAS,
    ];
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (useSceneStore.getState().doodleWallPhase !== 'drawing') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toCanvasXY(e);
    const stroke: Stroke = {
      hex: INK_PALETTE[inkIndex].hex,
      size: BRUSH_SIZES[brushIndex],
      pts: [x, y],
    };
    liveStrokeRef.current = stroke;
    const ctx = getCtx();
    if (ctx) paintStroke(ctx, stroke); // the tap dot
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = liveStrokeRef.current;
    if (!stroke) return;
    const [x, y] = toCanvasXY(e);
    const n = stroke.pts.length;
    const [px, py] = [stroke.pts[n - 2], stroke.pts[n - 1]];
    stroke.pts.push(x, y);
    const ctx = getCtx();
    if (ctx) {
      // incremental segment — the full stroke is only replayed on undo/redraw
      ctx.strokeStyle = stroke.hex;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const onPointerEnd = () => {
    const stroke = liveStrokeRef.current;
    if (!stroke) return;
    liveStrokeRef.current = null;
    const strokes = strokesRef.current;
    strokes.push(stroke);
    // Undo runs UNDO_DEPTH deep: older strokes are baked into a base image.
    if (strokes.length > UNDO_DEPTH) {
      const off = document.createElement('canvas');
      off.width = off.height = CANVAS;
      const ctx = off.getContext('2d');
      if (ctx) {
        paintGround(ctx);
        if (bakedRef.current) ctx.putImageData(bakedRef.current, 0, 0);
        while (strokes.length > UNDO_DEPTH) paintStroke(ctx, strokes.shift() as Stroke);
        bakedRef.current = ctx.getImageData(0, 0, CANVAS, CANVAS);
      }
    }
    setStrokeCount(strokes.length);
    setDirty(true);
  };

  const undo = () => {
    const strokes = strokesRef.current;
    if (!strokes.length) return;
    strokes.pop();
    redraw();
    setStrokeCount(strokes.length);
    if (!strokes.length && !bakedRef.current) setDirty(false);
  };

  // --- Submit: export 512 → 256 PNG, strip the data: prefix, POST ---
  const submit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || useSceneStore.getState().doodleWallPhase === 'submitting') return;
    setPhase('submitting');
    const started = performance.now();
    try {
      const out = document.createElement('canvas');
      out.width = out.height = STORED_TILE_SIZE; // the server requires exactly 256×256
      const ctx = out.getContext('2d');
      if (!ctx) throw new Error('no-2d-context');
      ctx.drawImage(canvas, 0, 0, STORED_TILE_SIZE, STORED_TILE_SIZE);
      const image = out.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      // mirror the server's byte ceiling client-side (base64 → ~3/4 bytes)
      if (image.length * 0.75 > TILE_MAX_BYTES) throw new Error('too-large');

      const res = await fetch('/api/tiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      // hold the submitting state briefly so it registers rather than flashes
      const wait = SUBMIT_FEEDBACK_MIN_MS - (performance.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      if (res.status === 201) {
        setPhase('submitted');
        return;
      }
      setErrorKind(res.status === 429 ? 'rate-limited' : 'failed');
      setPhase('error');
    } catch {
      setErrorKind('failed');
      setPhase('error');
    }
  };

  const drawAnother = () => {
    resetCanvas();
    setPhase('drawing');
  };

  return (
    <>
      <div className="pointer-events-auto absolute inset-0 overflow-y-auto bg-background-primary/55 backdrop-blur-[2px]">
        <div className="mx-auto w-full max-w-5xl p-4 pb-8 pt-16 md:p-8 md:pt-16">
          <div className="grid items-start gap-5 md:grid-cols-[minmax(0,10fr)_minmax(0,9fr)]">
            {/* Drawing surface + tools */}
            <section
              aria-label="Draw your tile"
              className="ticket-frame halftone rounded-[5px] p-4 md:p-5"
            >
              <p className="font-fell-sc text-[12px] tracking-[0.22em] text-brass-text">
                Your tile
              </p>
              <canvas
                ref={canvasRef}
                width={CANVAS}
                height={CANVAS}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                aria-label="Drawing surface — draw with your pointer or finger"
                className="mt-3 w-full cursor-crosshair touch-none rounded-[3px]"
                style={{ backgroundColor: TILE_GROUND, aspectRatio: '1 / 1' }}
              />

              {/* Inks */}
              <div
                className="mt-4 flex flex-wrap items-center gap-2"
                role="group"
                aria-label="Neon inks"
              >
                {INK_PALETTE.map((ink, i) => (
                  <button
                    key={ink.hex}
                    onClick={() => setInkIndex(i)}
                    aria-label={`${ink.name} ink`}
                    aria-pressed={i === inkIndex}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      i === inkIndex
                        ? 'scale-110 ring-2 ring-ink ring-offset-2'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: ink.hex }}
                  />
                ))}
              </div>

              {/* Brushes + undo/clear */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Brush sizes" className="flex items-center gap-2">
                  {BRUSH_SIZES.map((size, i) => (
                    <button
                      key={size}
                      onClick={() => setBrushIndex(i)}
                      aria-label={`${['Fine', 'Medium', 'Broad'][i]} brush`}
                      aria-pressed={i === brushIndex}
                      className={`paper-button flex h-9 w-9 items-center justify-center rounded-[3px] ${
                        i === brushIndex ? 'ring-2 ring-ink' : ''
                      }`}
                    >
                      <span
                        aria-hidden
                        className="block rounded-full bg-ink"
                        style={{ width: 4 + i * 4, height: 4 + i * 4 }}
                      />
                    </button>
                  ))}
                </div>
                <span aria-hidden className="text-ink-soft/50">
                  |
                </span>
                <button
                  onClick={undo}
                  disabled={strokeCount === 0}
                  className="paper-button rounded-[3px] px-3 py-2 font-fell-sc text-[13px] tracking-[0.06em] disabled:opacity-40"
                >
                  Undo
                </button>
                <button
                  onClick={resetCanvas}
                  disabled={!dirty}
                  className="paper-button rounded-[3px] px-3 py-2 font-fell-sc text-[13px] tracking-[0.06em] disabled:opacity-40"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={submit}
                disabled={!dirty || phase === 'submitting'}
                className="paper-button mt-4 w-full rounded-[3px] px-6 py-3 font-fell-sc text-[15px] tracking-[0.06em] disabled:opacity-40"
              >
                {phase === 'submitting' ? 'Handing it over…' : 'Hand it to the carny'}
              </button>
            </section>

            {/* The approved wall — all 48, newest first */}
            <section
              aria-label="The doodle wall — approved tiles, newest first"
              className="ticket-frame rounded-[5px] p-4 md:p-5"
            >
              <p className="font-fell-sc text-[12px] tracking-[0.22em] text-brass-text">The wall</p>
              {wall.length > 0 ? (
                <ul
                  className="mt-3 grid list-none gap-1.5 p-0"
                  style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                >
                  {wall.map((tile) => (
                    <li key={tile.id}>
                      {/* imageUrl is a data URI in stub mode, an https Storage
                          URL with Supabase — <img> takes both. */}
                      <img
                        src={tile.imageUrl}
                        alt="A visitor's tile"
                        width={STORED_TILE_SIZE}
                        height={STORED_TILE_SIZE}
                        loading="lazy"
                        className="w-full rounded-[2px]"
                        style={{ backgroundColor: TILE_GROUND }}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-fell mt-3 text-[14px] italic text-ink-soft">
                  The wall is bare — be the first to hang a tile.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Cards over the wall view: with-the-carny / error */}
      <AnimatePresence>
        {phase === 'submitted' && (
          <CardShell>
            <h2 className="font-rye letterpress text-[32px] text-ink">Handed to the carny</h2>
            <p className="font-fell mt-3 text-[15px] leading-relaxed text-ink/90">
              Your tile is in the pre-moderation queue — the carny shows every drawing to Nick
              before it hangs. Check back soon and you might spot it on the wall.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={drawAnother}
                className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
              >
                Draw another
              </button>
              <button
                onClick={exitAll}
                className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[14px] tracking-[0.06em]"
              >
                Back to the carnival
              </button>
            </div>
          </CardShell>
        )}

        {phase === 'error' && errorKind === 'rate-limited' && (
          <CardShell>
            <h2 className="font-rye letterpress text-[30px] text-ink">
              The carny&apos;s hands are full
            </h2>
            <p className="font-fell mt-3 text-[15px] leading-relaxed text-ink/90">
              He takes {SUBMIT_BURST_PER_MINUTE} tiles a minute — and {SUBMIT_DAILY_CAP} a day —
              from any one visitor. Catch your breath, admire the wall, and try again in a little
              while. Your drawing is safe.
            </p>
            <button
              onClick={() => setPhase('drawing')}
              className="paper-button mt-6 rounded-[3px] px-5 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
            >
              Back to the wall
            </button>
          </CardShell>
        )}

        {phase === 'error' && errorKind === 'failed' && (
          <CardShell>
            <h2 className="font-rye letterpress text-[30px] text-ink">The carny fumbled it</h2>
            <p className="font-fell mt-3 text-[15px] leading-relaxed text-ink/90">
              Your tile didn&apos;t make it across the counter — nothing lost, your drawing is still
              here. Give it another go.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={submit}
                className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[15px] tracking-[0.06em]"
              >
                Try again
              </button>
              <button
                onClick={() => setPhase('drawing')}
                className="paper-button rounded-[3px] px-5 py-3 font-fell-sc text-[14px] tracking-[0.06em]"
              >
                Keep drawing
              </button>
            </div>
          </CardShell>
        )}
      </AnimatePresence>
    </>
  );
}
