"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { buildDocument, layoutsForMode } from "@/lib/editor/layouts";
import {
  loadPresets,
  deletePreset as storageDelete,
  savePreset as storageSave,
} from "@/lib/editor/presets";
import { modeById } from "@/lib/editor/sizes";
import { themeById } from "@/lib/editor/themes";
import type {
  BatchItem,
  BrandPreset,
  EditorDocument,
  EditorElement,
  ElementPatch,
  ModeId,
} from "@/lib/editor/types";

export interface EditorState {
  document: EditorDocument;
  layoutId: string;
  themeId: string;
  selectedId: string | null;
  images: Record<string, string>;
  batch: BatchItem[];
  presets: BrandPreset[];
}

export type EditorAction =
  | { type: "setMode"; mode: ModeId }
  | { type: "setSize"; sizeId: string }
  | { type: "setLayout"; layoutId: string }
  | { type: "setTheme"; themeId: string }
  | { type: "select"; id: string | null }
  | { type: "updateElement"; id: string; patch: ElementPatch }
  | { type: "moveElement"; id: string; x: number; y: number }
  | { type: "removeElement"; id: string }
  | { type: "reorderElement"; id: string; direction: "up" | "down" }
  | { type: "addText" }
  | { type: "addImageSlot" }
  | { type: "setImageSrc"; id: string; dataUrl: string }
  | { type: "addToBatch"; label: string }
  | { type: "removeBatchItem"; id: string }
  | { type: "savePreset"; name: string }
  | { type: "applyPreset"; preset: BrandPreset }
  | { type: "deletePreset"; name: string }
  | { type: "hydratePresets"; presets: BrandPreset[] };

function withDocument(state: EditorState, document: EditorDocument): EditorState {
  return { ...state, document };
}

function replaceElement(document: EditorDocument, id: string, patch: ElementPatch): EditorDocument {
  const elements: EditorElement[] = document.elements.map((el): EditorElement => {
    if (el.id !== id) return el;
    if (el.kind === "text") return { ...el, ...patch, id: el.id, kind: "text" };
    if (el.kind === "image") return { ...el, ...patch, id: el.id, kind: "image" };
    return { ...el, ...patch, id: el.id, kind: "shape" };
  });
  return { ...document, elements };
}

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "setMode": {
      const spec = modeById(action.mode);
      const theme = themeById(state.themeId);
      const layout = layoutsForMode(action.mode)[0];
      return {
        ...state,
        layoutId: layout.id,
        selectedId: null,
        document: buildDocument(action.mode, spec.defaultSizeId, layout.id, theme),
      };
    }
    case "setSize":
      return {
        ...state,
        selectedId: null,
        document: buildDocument(
          state.document.mode,
          action.sizeId,
          state.layoutId,
          themeById(state.themeId),
        ),
      };
    case "setLayout":
      return {
        ...state,
        layoutId: action.layoutId,
        selectedId: null,
        document: buildDocument(
          state.document.mode,
          state.document.sizeId,
          action.layoutId,
          themeById(state.themeId),
        ),
      };
    case "setTheme":
      return {
        ...state,
        themeId: action.themeId,
        document: { ...state.document, background: themeById(action.themeId).background },
      };
    case "select":
      return { ...state, selectedId: action.id };
    case "updateElement":
      return withDocument(state, replaceElement(state.document, action.id, action.patch));
    case "moveElement":
      return withDocument(
        state,
        replaceElement(state.document, action.id, { x: action.x, y: action.y }),
      );
    case "removeElement":
      return {
        ...state,
        selectedId: null,
        document: {
          ...state.document,
          elements: state.document.elements.filter((el) => el.id !== action.id),
        },
      };
    case "reorderElement": {
      const list = [...state.document.elements];
      const index = list.findIndex((el) => el.id === action.id);
      if (index < 0) return state;
      const target = action.direction === "up" ? index + 1 : index - 1;
      if (target < 0 || target >= list.length) return state;
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);
      return withDocument(state, { ...state.document, elements: list });
    }
    case "addText": {
      const doc = state.document;
      const el: EditorElement = {
        id: `custom-text-${Date.now()}`,
        kind: "text",
        x: doc.width / 2,
        y: doc.height / 2,
        text: "New text",
        fontFamily: "Space Grotesk",
        fontSize: Math.round(doc.height * 0.06),
        fontWeight: 700,
        color: "#1d1d1b",
        align: "center",
        lineHeight: 1.15,
        maxWidth: Math.round(doc.width * 0.8),
        uppercase: false,
      };
      return {
        ...withDocument(state, { ...doc, elements: [...doc.elements, el] }),
        selectedId: el.id,
      };
    }
    case "addImageSlot": {
      const doc = state.document;
      const el: EditorElement = {
        id: `custom-image-${Date.now()}`,
        kind: "image",
        x: doc.width / 2,
        y: doc.height / 2,
        width: Math.round(doc.width * 0.4),
        height: Math.round(doc.width * 0.4),
        src: null,
        circle: false,
        borderColor: null,
        borderWidth: 0,
        placeholder: "Drop an image",
      };
      return {
        ...withDocument(state, { ...doc, elements: [...doc.elements, el] }),
        selectedId: el.id,
      };
    }
    case "setImageSrc": {
      const images = { ...state.images, [action.id]: action.dataUrl };
      const document = replaceElement(state.document, action.id, { src: action.id });
      return { ...state, images, document };
    }
    case "addToBatch": {
      // [WHY] Batch entries must not mutate when the editor keeps changing.
      const snapshotText = JSON.stringify(state.document);
      const item: BatchItem = {
        id: `batch-${Date.now()}`,
        label: action.label,
        document: JSON.parse(snapshotText),
      };
      return { ...state, batch: [...state.batch, item] };
    }
    case "removeBatchItem":
      return { ...state, batch: state.batch.filter((b) => b.id !== action.id) };
    case "savePreset": {
      const preset: BrandPreset = {
        name: action.name,
        savedAt: new Date().toISOString(),
        themeId: state.themeId,
        fontFamily: "Space Grotesk",
        background: state.document.background,
      };
      return { ...state, presets: storageSave(preset) };
    }
    case "applyPreset":
      return {
        ...state,
        themeId: action.preset.themeId,
        document: { ...state.document, background: action.preset.background },
      };
    case "deletePreset":
      return { ...state, presets: storageDelete(action.name) };
    case "hydratePresets":
      return { ...state, presets: action.presets };
    default:
      return state;
  }
}

export function useEditor() {
  const initial = useMemo<EditorState>(() => {
    const theme = themeById("riso-paper");
    const layout = layoutsForMode("portfolio")[0];
    return {
      document: buildDocument("portfolio", "4x3", layout.id, theme),
      layoutId: layout.id,
      themeId: theme.id,
      selectedId: null,
      images: {},
      batch: [],
      presets: [],
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    dispatch({ type: "hydratePresets", presets: loadPresets() });
  }, []);

  const setLayout = useCallback(
    (layoutId: string) => dispatch({ type: "setLayout", layoutId }),
    [],
  );

  return { state, dispatch, setLayout };
}
