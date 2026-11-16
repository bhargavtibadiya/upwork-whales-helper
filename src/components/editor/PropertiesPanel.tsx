"use client";

import { useRef } from "react";
import type { EditorAction } from "@/hooks/useEditor";
import { CANVAS_FONT_FAMILIES } from "@/lib/editor/export";
import type { EditorElement, ImageElement, ShapeElement, TextElement } from "@/lib/editor/types";

interface PropertiesPanelProps {
  element: EditorElement | null;
  dispatch: React.Dispatch<EditorAction>;
}

const inputCls = "w-full rounded-riso border-2 border-ink bg-sunken px-3 py-2 text-sm text-ink";
const labelCls = "mb-1 block text-xs font-bold tracking-wide text-ink-soft";

function TextFields({ el, dispatch }: { el: TextElement; dispatch: React.Dispatch<EditorAction> }) {
  return (
    <>
      <div>
        <label className={labelCls} htmlFor="prop-text">
          Text
        </label>
        <textarea
          id="prop-text"
          className={inputCls}
          rows={2}
          value={el.text}
          onChange={(e) =>
            dispatch({ type: "updateElement", id: el.id, patch: { text: e.target.value } })
          }
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="prop-font">
          Font
        </label>
        <select
          id="prop-font"
          className={inputCls}
          value={el.fontFamily}
          onChange={(e) =>
            dispatch({ type: "updateElement", id: el.id, patch: { fontFamily: e.target.value } })
          }
        >
          {CANVAS_FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls} htmlFor="prop-size">
            Size ({Math.round(el.fontSize)}px)
          </label>
          <input
            id="prop-size"
            type="range"
            min={8}
            max={400}
            value={el.fontSize}
            onChange={(e) =>
              dispatch({
                type: "updateElement",
                id: el.id,
                patch: { fontSize: Number(e.target.value) },
              })
            }
            className="w-full accent-drum-pink"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="prop-weight">
            Weight
          </label>
          <select
            id="prop-weight"
            className={inputCls}
            value={el.fontWeight}
            onChange={(e) =>
              dispatch({
                type: "updateElement",
                id: el.id,
                patch: { fontWeight: Number(e.target.value) },
              })
            }
          >
            {[400, 500, 600, 700, 800, 900].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls} htmlFor="prop-color">
            Colour
          </label>
          <input
            id="prop-color"
            type="color"
            className="h-10 w-full border-2 border-ink bg-surface"
            value={el.color}
            onChange={(e) =>
              dispatch({ type: "updateElement", id: el.id, patch: { color: e.target.value } })
            }
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="prop-align">
            Align
          </label>
          <select
            id="prop-align"
            className={inputCls}
            value={el.align}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "left" || value === "center" || value === "right") {
                dispatch({ type: "updateElement", id: el.id, patch: { align: value } });
              }
            }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input
          type="checkbox"
          checked={el.uppercase}
          onChange={(e) =>
            dispatch({ type: "updateElement", id: el.id, patch: { uppercase: e.target.checked } })
          }
          className="h-4 w-4 accent-drum-pink"
        />
        Uppercase
      </label>
    </>
  );
}

function ImageFields({
  el,
  dispatch,
}: {
  el: ImageElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <div>
        <label className={labelCls} htmlFor="prop-upload">
          Image file
        </label>
        <input
          id="prop-upload"
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="w-full text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file === undefined) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                dispatch({ type: "setImageSrc", id: el.id, dataUrl: reader.result });
              }
            };
            reader.readAsDataURL(file);
          }}
        />
        <p className="mt-1 text-xs text-ink-muted">Stays in your browser. Nothing is uploaded.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls} htmlFor="prop-iw">
            Width ({el.width}px)
          </label>
          <input
            id="prop-iw"
            type="range"
            min={40}
            max={1600}
            value={el.width}
            onChange={(e) => {
              const width = Number(e.target.value);
              dispatch({ type: "updateElement", id: el.id, patch: { width, height: width } });
            }}
            className="w-full accent-drum-pink"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="prop-bw">
            Ring ({el.borderWidth}px)
          </label>
          <input
            id="prop-bw"
            type="range"
            min={0}
            max={60}
            value={el.borderWidth}
            onChange={(e) =>
              dispatch({
                type: "updateElement",
                id: el.id,
                patch: { borderWidth: Number(e.target.value) },
              })
            }
            className="w-full accent-drum-pink"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input
          type="checkbox"
          checked={el.circle}
          onChange={(e) =>
            dispatch({ type: "updateElement", id: el.id, patch: { circle: e.target.checked } })
          }
          className="h-4 w-4 accent-drum-pink"
        />
        Circle crop
      </label>
      {el.borderWidth > 0 && (
        <div>
          <label className={labelCls} htmlFor="prop-bc">
            Ring colour
          </label>
          <input
            id="prop-bc"
            type="color"
            className="h-10 w-full border-2 border-ink bg-surface"
            value={el.borderColor ?? "#ff48b0"}
            onChange={(e) =>
              dispatch({ type: "updateElement", id: el.id, patch: { borderColor: e.target.value } })
            }
          />
        </div>
      )}
    </>
  );
}

function ShapeFields({
  el,
  dispatch,
}: {
  el: ShapeElement;
  dispatch: React.Dispatch<EditorAction>;
}) {
  return (
    <>
      <div>
        <label className={labelCls} htmlFor="prop-fill">
          Fill
        </label>
        <input
          id="prop-fill"
          type="color"
          className="h-10 w-full border-2 border-ink bg-surface"
          value={el.fill}
          onChange={(e) =>
            dispatch({ type: "updateElement", id: el.id, patch: { fill: e.target.value } })
          }
        />
      </div>
      <div>
        <label className={labelCls} htmlFor="prop-rot">
          Rotation ({el.rotation} deg)
        </label>
        <input
          id="prop-rot"
          type="range"
          min={0}
          max={360}
          value={el.rotation}
          onChange={(e) =>
            dispatch({
              type: "updateElement",
              id: el.id,
              patch: { rotation: Number(e.target.value) },
            })
          }
          className="w-full accent-drum-pink"
        />
      </div>
    </>
  );
}

export function PropertiesPanel({ element, dispatch }: PropertiesPanelProps) {
  if (element === null) {
    return (
      <div className="text-sm text-ink-muted">
        <h3 className="riso-kicker mb-2">
          <span>+</span>Element
        </h3>
        Select an element on the canvas to edit it. Drag elements to move them.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="riso-kicker capitalize">
          <span>+</span>
          {element.kind}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            title="Bring forward"
            className="riso-btn border-2 border-ink bg-sunken px-2 py-1 text-xs font-bold hover:shadow-btn-hover"
            onClick={() => dispatch({ type: "reorderElement", id: element.id, direction: "up" })}
          >
            Up
          </button>
          <button
            type="button"
            title="Send backward"
            className="riso-btn border-2 border-ink bg-sunken px-2 py-1 text-xs font-bold hover:shadow-btn-hover"
            onClick={() => dispatch({ type: "reorderElement", id: element.id, direction: "down" })}
          >
            Down
          </button>
          <button
            type="button"
            className="riso-btn border-2 border-ink bg-drum-pink px-2 py-1 text-xs font-bold hover:bg-drum-pink-hover"
            onClick={() => dispatch({ type: "removeElement", id: element.id })}
          >
            Delete
          </button>
        </div>
      </div>
      {element.kind === "text" && <TextFields el={element} dispatch={dispatch} />}
      {element.kind === "image" && <ImageFields el={element} dispatch={dispatch} />}
      {element.kind === "shape" && <ShapeFields el={element} dispatch={dispatch} />}
    </div>
  );
}
