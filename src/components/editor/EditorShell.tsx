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
      <header className="flex flex-col gap-1 border-b-2 border-ink pb-4">
        <h1 className="text-2xl font-bold md:text-3xl">Upwork Whales Helper</h1>
        <p className="text-sm text-ink-soft">
          Profile pictures, portfolio thumbnails and intro-video thumbnails. Everything renders in
          your browser.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="order-2 lg:order-1">
          <ControlsPanel
            state={state}
            layoutId={state.layoutId}
            onLayout={setLayout}
            dispatch={dispatch}
          />
        </aside>

        <section className="order-1 flex flex-col gap-4 lg:order-2">
          <CanvasStage
            document={state.document}
            imageData={state.images}
            selectedId={state.selectedId}
            dispatch={dispatch}
          />
          <ExportBar state={state} dispatch={dispatch} />
        </section>

        <aside className="order-3">
          <PropertiesPanel element={selected} dispatch={dispatch} />
        </aside>
      </div>

      <footer className="border-t-2 border-ink pt-3 text-xs text-ink-muted">
        Original reimplementation - no code or assets from the reference tool. No backend; no
        uploads.
      </footer>
    </main>
  );
}
