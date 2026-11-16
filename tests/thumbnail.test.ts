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
  it("offers all four intro presets in the reference order", () =>
    expect(STYLES.filter((s) => s.mode === "intro").map((s) => s.name)).toEqual([
      "Meet me",
      "Title banner",
      "Big hello",
      "Watch this + proof",
    ]));
  it("provides three portfolio layouts and one profile ring", () => {
    expect(STYLES.filter((s) => s.mode === "portfolio")).toHaveLength(3);
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
