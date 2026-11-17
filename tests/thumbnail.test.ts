import { describe, expect, it } from "vitest";
import { cropPlacement } from "../src/lib/thumbnail/brush";
import {
  changeMode,
  changeStyle,
  dimensions,
  fieldValue,
  initialState,
  STYLES,
  setField,
  spec,
} from "../src/lib/thumbnail/model";

describe("reference contract", () => {
  it("offers all ten intro presets with the reference four first", () =>
    expect(STYLES.filter((s) => s.mode === "intro").map((s) => s.name)).toEqual([
      "Meet me",
      "Title banner",
      "Big hello",
      "Watch this + proof",
      "Split intro",
      "Center stage",
      "Stats strip",
      "Title + skills",
      "The specialist",
      "Personal brand",
    ]));
  it("provides ten portfolio layouts and one profile ring", () => {
    expect(STYLES.filter((s) => s.mode === "portfolio").map((s) => s.name)).toEqual([
      "Result + screenshot",
      "Face + big stat",
      "Client results",
      "Client quote",
      "Service blueprint",
      "Project cover",
      "Impact report",
      "Project spotlight",
      "The transformation",
      "Minimal showcase",
    ]);
    expect(STYLES.filter((s) => s.mode === "profile")).toHaveLength(1);
  });
  it("starts each mode in the correct style", () => {
    expect(initialState("intro").style).toBe("meet");
    expect(initialState().style).toBe("result");
    expect(initialState("profile").style).toBe("profile");
  });
  it("fixes intro to 1280x720 and profile to 1000x1000", () => {
    expect(dimensions(initialState("intro"))).toEqual([1280, 720]);
    expect(dimensions(initialState("profile"))).toEqual([1000, 1000]);
    expect(dimensions(initialState())).toEqual([1000, 750]);
  });
  it("retains each mode's last layout", () => {
    let s = changeStyle(initialState("intro"), "hello");
    s = changeMode(s, "portfolio");
    expect(s.style).toBe("result");
    expect(changeMode(s, "intro").style).toBe("hello");
  });
  it("keeps layout-specific titles separate", () => {
    let s = setField(initialState("intro"), "headline", "CUSTOM");
    s = changeStyle(s, "banner");
    expect(fieldValue(s, "headline")).toBe("FULL STACK");
    s = changeStyle(s, "meet");
    expect(fieldValue(s, "headline")).toBe("CUSTOM");
  });
  it("shares identity fields across presets without erasing them", () => {
    let s = setField(initialState("intro"), "name", "Bhargav");
    s = changeStyle(s, "hello");
    expect(fieldValue(s, "name")).toBe("Bhargav");
  });
  it("allows empty optional words rather than restoring defaults", () =>
    expect(fieldValue(setField(initialState("intro"), "role", ""), "role")).toBe(""));
  it("has real fields and defaults for every preset", () => {
    for (const s of STYLES) {
      expect(spec(s.id).id).toBe(s.id);
      for (const k of s.fields.filter((k) => !["stats", "chips"].includes(k)))
        expect(k in s.defaults).toBe(true);
    }
  });
  it("keeps image crop and theme when switching layout", () => {
    const s = {
      ...initialState("intro"),
      palette: "blue" as const,
      face: { image: null, name: "photo.png", zoom: 175, x: 20, y: 70 },
    };
    expect(changeStyle(s, "proof").face).toEqual(s.face);
    expect(changeStyle(s, "hello").palette).toBe("blue");
  });
  it("cover-fits an image and applies crop percentages", () => {
    const actual = cropPlacement(800, 600, [0, 0, 400, 400], { zoom: 100, x: 50, y: 0 });
    [-200 / 3, 0, 1600 / 3, 400].forEach((value, index) => {
      expect(actual[index]).toBeCloseTo(value);
    });
  });
  it("zooms and positions both axes", () => {
    expect(cropPlacement(100, 100, [10, 20, 100, 100], { zoom: 200, x: 100, y: 100 })).toEqual([
      -90, -80, 200, 200,
    ]);
  });
});

describe("research-led revision contract", () => {
  it("keeps every original style and editing field", () => {
    const originals: Record<string, string[]> = {
      result: ["pill", "headline", "subline"],
      stat: ["pill", "headline", "subline", "stats", "services"],
      reviews: ["pill", "headline", "subline", "badge", "stats"],
      meet: ["headline", "name", "role"],
      banner: ["headline", "headline2", "subline", "chips", "badge", "badge2"],
      hello: ["headline", "name", "role"],
      proof: ["pill", "stats", "services"],
    };
    for (const [id, fields] of Object.entries(originals)) {
      const item = STYLES.find((s) => s.id === id);
      expect(item).toBeDefined();
      for (const f of fields) expect(item?.fields).toContain(f);
    }
  });
  it("uses a small media play control without default arrow or label", () => {
    const s = initialState();
    expect(s.play).toBe(true);
    expect(s.arrow).toBe(false);
    expect(s.overlayLabel).toBe(false);
  });
  it("preserves finishing choices when changing styles", () => {
    const s = {
      ...initialState(),
      originalLayout: true,
      browserFrame: true,
      portraitShape: "circle" as const,
      backdrop: "clean" as const,
    };
    const next = changeStyle(s, "reviews");
    expect(next.originalLayout).toBe(true);
    expect(next.browserFrame).toBe(true);
    expect(next.portraitShape).toBe("circle");
    expect(next.backdrop).toBe("clean");
  });
  it("keeps all three stats editable in every supporting style", () => {
    for (const spec of STYLES.filter((s) => s.fields.includes("stats"))) {
      expect(spec.statCount).toBe(3);
      let s = changeStyle(initialState(spec.mode), spec.id);
      s = setField(s, "stat3v", "777");
      expect(fieldValue(s, "stat3v")).toBe("777");
    }
  });
});
