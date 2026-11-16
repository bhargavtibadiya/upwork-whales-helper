"use client";

import { useState } from "react";
import type { EditorAction, EditorState } from "@/hooks/useEditor";
import { exportBatchZip, exportDocumentPng, loadImageMap } from "@/lib/editor/export";

interface ExportBarProps {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

const btnPrimary =
  "border-2 border-ink bg-drum-pink px-4 py-2 text-sm font-bold text-ink shadow-dropdown transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50";
const btnSecondary =
  "border-2 border-ink bg-drum-blue px-4 py-2 text-sm font-bold text-surface shadow-card active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50";
const btnPlain =
  "border-2 border-ink bg-surface px-3 py-2 text-sm font-bold hover:shadow-btn-hover";

export function ExportBar({ state, dispatch }: ExportBarProps) {
  const [busy, setBusy] = useState<boolean>(false);
  const [presetName, setPresetName] = useState<string>("");
  const [batchLabel, setBatchLabel] = useState<string>("");

  async function withBusy(job: () => Promise<void>): Promise<void> {
    setBusy(true);
    try {
      await job();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border-2 border-ink bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btnPrimary}
          disabled={busy}
          onClick={() =>
            void withBusy(async () => {
              const images = await loadImageMap(state.images);
              await exportDocumentPng(
                state.document,
                images,
                `${state.document.mode}-${state.document.sizeId}`,
              );
            })
          }
        >
          Download PNG
        </button>
        <span className="text-xs text-ink-muted">
          {state.document.width} x {state.document.height} px - your images never leave your browser
        </span>
      </div>

      <div className="border-t-2 border-ink pt-3">
        <h3 className="mb-2 text-sm font-bold">Brand presets</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={presetName}
            placeholder="Preset name"
            className="border-2 border-ink bg-sunken px-3 py-2 text-sm"
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button
            type="button"
            className={btnPlain}
            disabled={presetName.trim() === ""}
            onClick={() => {
              dispatch({ type: "savePreset", name: presetName.trim() });
              setPresetName("");
            }}
          >
            Save current look
          </button>
        </div>
        {state.presets.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {state.presets.map((p) => (
              <li
                key={p.name}
                className="flex items-center gap-1 border-2 border-ink bg-sunken px-2 py-1 text-xs font-bold"
              >
                <button type="button" onClick={() => dispatch({ type: "applyPreset", preset: p })}>
                  {p.name}
                </button>
                <button
                  type="button"
                  aria-label={`Delete preset ${p.name}`}
                  className="text-drum-pink"
                  onClick={() => dispatch({ type: "deletePreset", name: p.name })}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t-2 border-ink pt-3">
        <h3 className="mb-2 text-sm font-bold">Batch export ({state.batch.length})</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={batchLabel}
            placeholder="Label for this version"
            className="border-2 border-ink bg-sunken px-3 py-2 text-sm"
            onChange={(e) => setBatchLabel(e.target.value)}
          />
          <button
            type="button"
            className={btnPlain}
            onClick={() => {
              dispatch({
                type: "addToBatch",
                label:
                  batchLabel.trim() === ""
                    ? `version-${state.batch.length + 1}`
                    : batchLabel.trim(),
              });
              setBatchLabel("");
            }}
          >
            Add current to batch
          </button>
          <button
            type="button"
            className={btnSecondary}
            disabled={busy || state.batch.length === 0}
            onClick={() =>
              void withBusy(async () => {
                const images = await loadImageMap(state.images);
                await exportBatchZip(state.batch, images);
              })
            }
          >
            Export all as ZIP
          </button>
        </div>
        {state.batch.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {state.batch.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between border-2 border-ink bg-sunken px-2 py-1 text-xs font-bold"
              >
                <span>
                  {b.label} ({b.document.width}x{b.document.height})
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${b.label} from batch`}
                  className="text-drum-pink"
                  onClick={() => dispatch({ type: "removeBatchItem", id: b.id })}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
