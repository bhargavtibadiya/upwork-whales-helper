import { describe, expect, it } from "vitest";
import { fileStem } from "../src/lib/editor/export";
import { buildDocument, layoutsForMode, resetIdCounter } from "../src/lib/editor/layouts";
import { canvasFont, hitTest, renderDocument, wrapLines } from "../src/lib/editor/render";
import { themeById } from "../src/lib/editor/themes";
import type { TextElement } from "../src/lib/editor/types";

// [WHY] renderDocument needs a 2d context; this stub measures text as 10px per
// character so wrapping and hit-testing stay deterministic without a browser.
function stubContext(): CanvasRenderingContext2D {
  const stub = {
    measureText: (text: string) => ({ width: text.length * 10 }),
    fillRect: () => undefined,
    save: () => undefined,
    restore: () => undefined,
    translate: () => undefined,
    rotate: () => undefined,
    beginPath: () => undefined,
    arc: () => undefined,
    rect: () => undefined,
    clip: () => undefined,
    drawImage: () => undefined,
    fill: () => undefined,
    stroke: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    closePath: () => undefined,
    roundRect: () => undefined,
    setLineDash: () => undefined,
    fillText: () => undefined,
    strokeRect: () => undefined,
    createLinearGradient: () => ({ addColorStop: () => undefined }),
  };
  return stub as unknown as CanvasRenderingContext2D;
}

function makeText(partial: Partial<TextElement>): TextElement {
  return {
    id: "t1",
    kind: "text",
    x: 100,
    y: 100,
    text: "hello world",
    fontFamily: "Anton",
    fontSize: 40,
    fontWeight: 700,
    color: "#000000",
    align: "left",
    lineHeight: 1.1,
    maxWidth: null,
    uppercase: false,
    ...partial,
  };
}

describe("buildDocument", () => {
  it("builds every layout for every mode at its allowed sizes", () => {
    for (const mode of ["profile", "portfolio", "intro"] as const) {
      const layouts = layoutsForMode(mode);
      expect(layouts.length).toBeGreaterThan(0);
      for (const layout of layouts) {
        const doc = buildDocument(
          mode,
          mode === "intro" ? "16x9" : mode === "profile" ? "1x1" : "4x3",
          layout.id,
          themeById("riso-paper"),
        );
        expect(doc.elements.length).toBeGreaterThan(0);
        expect(doc.width).toBeGreaterThan(0);
      }
    }
  });

  it("rejects a size that the mode does not allow", () => {
    expect(() =>
      buildDocument("profile", "16x9", "ringed-photo", themeById("riso-paper")),
    ).toThrow();
  });
});

describe("wrapLines", () => {
  const ctx = stubContext();

  it("returns the raw lines when there is no max width", () => {
    expect(wrapLines(ctx, makeText({ maxWidth: null }))).toEqual(["hello world"]);
  });

  it("wraps words to the max width", () => {
    const lines = wrapLines(ctx, makeText({ maxWidth: 70 }));
    expect(lines).toEqual(["hello", "world"]);
  });

  it("uppercases when the flag is set", () => {
    expect(wrapLines(ctx, makeText({ uppercase: true }))).toEqual(["HELLO WORLD"]);
  });
});

describe("renderDocument + hitTest", () => {
  it("returns bounds for every element and hit-tests topmost first", () => {
    resetIdCounter();
    const doc = buildDocument("portfolio", "4x3", "shot-headline", themeById("riso-paper"));
    const ctx = stubContext();
    const { bounds } = renderDocument(ctx, doc, {});
    for (const el of doc.elements) {
      expect(bounds[el.id]).toBeDefined();
    }
    const last = doc.elements[doc.elements.length - 1];
    const b = bounds[last.id];
    const hit = hitTest(bounds, doc, b.x + b.width / 2, b.y + b.height / 2);
    expect(hit).toBe(last.id);
  });

  it("returns null when the point hits nothing", () => {
    resetIdCounter();
    const doc = buildDocument("portfolio", "4x3", "shot-headline", themeById("riso-paper"));
    const { bounds } = renderDocument(stubContext(), doc, {});
    expect(hitTest(bounds, doc, -50, -50)).toBeNull();
  });
});

describe("canvasFont", () => {
  it("formats a canvas font string", () => {
    expect(canvasFont(makeText({}))).toBe('700 40px "Anton", sans-serif');
  });
});

describe("fileStem", () => {
  it("slugifies labels for filenames", () => {
    expect(fileStem("My Client Results!")).toBe("my-client-results");
    expect(fileStem("***")).toBe("thumbnail");
  });
});
