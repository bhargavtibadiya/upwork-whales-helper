"use client";

import type { EditorAction, EditorState } from "@/hooks/useEditor";
import { layoutsForMode } from "@/lib/editor/layouts";
import { MODES, modeById, SIZES } from "@/lib/editor/sizes";
import { CANVAS_THEMES } from "@/lib/editor/themes";
import type { ModeId } from "@/lib/editor/types";

interface ControlsPanelProps {
  state: EditorState;
  layoutId: string;
  onLayout: (layoutId: string) => void;
  dispatch: React.Dispatch<EditorAction>;
}

const btnBase =
  "border-2 border-ink bg-surface px-3 py-2 text-left text-sm font-bold transition-shadow hover:shadow-btn-hover";
const btnActive = "bg-drum-pink text-ink shadow-dropdown";

export function ControlsPanel({ state, layoutId, onLayout, dispatch }: ControlsPanelProps) {
  const mode = state.document.mode;
  const spec = modeById(mode);
  const layouts = layoutsForMode(mode);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-2 text-base font-bold">What are you making?</h3>
        <div className="grid grid-cols-1 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${btnBase} ${mode === m.id ? btnActive : ""}`}
              onClick={() => dispatch({ type: "setMode", mode: m.id as ModeId })}
            >
              <span className="block">{m.label}</span>
              <span className="block text-xs font-normal text-ink-soft">{m.description}</span>
            </button>
          ))}
        </div>
      </section>

      {spec.sizeIds.length > 1 && (
        <section>
          <h3 className="mb-2 text-base font-bold">Size</h3>
          <div className="flex flex-wrap gap-2">
            {spec.sizeIds.map((id) => {
              const size = SIZES.find((s) => s.id === id);
              if (size === undefined) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className={`${btnBase} ${state.document.sizeId === id ? btnActive : ""}`}
                  onClick={() => dispatch({ type: "setSize", sizeId: id })}
                >
                  {size.width} x {size.height}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-base font-bold">Layout</h3>
        <div className="grid grid-cols-1 gap-2">
          {layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`${btnBase} ${layoutId === l.id ? btnActive : ""}`}
              onClick={() => onLayout(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-bold">Artwork theme</h3>
        <div className="flex flex-wrap gap-2">
          {CANVAS_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${btnBase} ${state.themeId === t.id ? btnActive : ""}`}
              onClick={() => dispatch({ type: "setTheme", themeId: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-bold">Add elements</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnBase} onClick={() => dispatch({ type: "addText" })}>
            + Text
          </button>
          <button
            type="button"
            className={btnBase}
            onClick={() => dispatch({ type: "addImageSlot" })}
          >
            + Image
          </button>
        </div>
      </section>
    </div>
  );
}
