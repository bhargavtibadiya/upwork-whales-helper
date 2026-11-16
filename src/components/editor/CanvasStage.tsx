"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorAction } from "@/hooks/useEditor";
import { hitTest, type ImageMap, renderDocument } from "@/lib/editor/render";
import type { EditorDocument, ElementBounds } from "@/lib/editor/types";

interface CanvasStageProps {
  document: EditorDocument;
  imageData: Record<string, string>;
  selectedId: string | null;
  dispatch: React.Dispatch<EditorAction>;
}

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

export function CanvasStage({ document: doc, imageData, selectedId, dispatch }: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayWidth, setDisplayWidth] = useState<number>(800);
  const [loaded, setLoaded] = useState<ImageMap>({});
  const boundsRef = useRef<Record<string, ElementBounds>>({});
  const dragRef = useRef<DragState | null>(null);

  // [WHY] The stage must fit narrow mobile panels and wide desktops alike.
  useEffect(() => {
    const node = containerRef.current;
    if (node === null) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry !== undefined) setDisplayWidth(Math.max(280, Math.floor(entry.contentRect.width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(imageData);
    const jobs = entries.map(
      ([key, dataUrl]) =>
        new Promise<[string, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve([key, img]);
          img.onerror = () => reject(new Error(`image failed to load: ${key}`));
          img.src = dataUrl;
        }),
    );
    Promise.all(jobs)
      .then((pairs) => {
        if (!cancelled) setLoaded(Object.fromEntries(pairs));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [imageData]);

  const scale = displayWidth / doc.width;
  const displayHeight = Math.round(doc.height * scale);

  // [WHY] No dep array: redraw after every render so scale, document, images
  // and selection can never disagree with the last painted frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    // [WHY] The bitmap is document-sized and CSS shrinks it to fit, so the
    // renderer always draws at 1:1 document coordinates. Clear first or a
    // redraw leaves ghosts.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, doc.width, doc.height);
    const { bounds } = renderDocument(ctx, doc, loaded);
    boundsRef.current = bounds;
    if (selectedId !== null && bounds[selectedId] !== undefined) {
      const b = bounds[selectedId];
      ctx.strokeStyle = "#0078bf";
      ctx.lineWidth = 3 / scale;
      ctx.setLineDash([8 / scale, 6 / scale]);
      ctx.strokeRect(b.x - 6, b.y - 6, b.width + 12, b.height + 12);
    }
  });

  const toDocCoords = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (canvas === null) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
    },
    [scale],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const point = toDocCoords(event);
      const id = hitTest(boundsRef.current, doc, point.x, point.y);
      dispatch({ type: "select", id });
      if (id !== null) {
        const el = doc.elements.find((candidate) => candidate.id === id);
        if (el !== undefined) {
          dragRef.current = { id, offsetX: el.x - point.x, offsetY: el.y - point.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }
    },
    [doc, dispatch, toDocCoords],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (drag === null) return;
      const point = toDocCoords(event);
      dispatch({
        type: "moveElement",
        id: drag.id,
        x: Math.round(point.x + drag.offsetX),
        y: Math.round(point.y + drag.offsetY),
      });
    },
    [dispatch, toDocCoords],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        width={doc.width}
        height={doc.height}
        style={{ width: displayWidth, height: displayHeight }}
        className="block border-2 border-ink bg-surface shadow-card touch-none cursor-move"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Thumbnail preview. Drag elements to move them."
      />
    </div>
  );
}
