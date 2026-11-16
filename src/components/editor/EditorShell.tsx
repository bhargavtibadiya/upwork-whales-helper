"use client";

import { useEditor } from "@/hooks/useEditor";
import { CanvasStage } from "./CanvasStage";
import { ControlsPanel } from "./ControlsPanel";
import { ExportBar } from "./ExportBar";
import { PropertiesPanel } from "./PropertiesPanel";

export function EditorShell() {
  const { state, dispatch, setLayout } = useEditor();
  const selected = state.document.elements.find((el) => el.id === state.selectedId) ?? null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <span className="riso-badge w-fit">Browser-local tool</span>
        <h1 className="riso-title text-3xl md:text-5xl">Upwork Whales Helper</h1>
        <p className="max-w-xl text-sm text-ink-soft md:text-base">
          Profile pictures, portfolio thumbnails and intro-video thumbnails. Everything renders in
          your browser - nothing is uploaded.
        </p>
        <hr className="riso-rule" />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="riso-card order-2 h-fit p-4 lg:order-1">
          <ControlsPanel
            state={state}
            layoutId={state.layoutId}
            onLayout={setLayout}
            dispatch={dispatch}
          />
        </aside>

        <section className="order-1 flex flex-col gap-6 lg:order-2">
          <CanvasStage
            document={state.document}
            imageData={state.images}
            selectedId={state.selectedId}
            dispatch={dispatch}
          />
          <ExportBar state={state} dispatch={dispatch} />
        </section>

        <aside className="riso-card order-3 h-fit p-4">
          <PropertiesPanel element={selected} dispatch={dispatch} />
        </aside>
      </div>

      <footer className="flex flex-col gap-3">
        <hr className="riso-rule" />
        <p className="text-xs text-ink-muted">
          Original reimplementation - no code or assets from the reference tool. No backend; no
          uploads.
        </p>
      </footer>
    </main>
  );
}
