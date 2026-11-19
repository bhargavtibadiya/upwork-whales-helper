import { describe, expect, it } from "vitest";
import {
  changeStyle,
  initialState,
  setField,
  type ThumbnailState,
} from "../src/lib/thumbnail/model";
import { applyPreset, decodePreset, encodePreset } from "../src/lib/thumbnail/preset";

const roundTrip = (state: ThumbnailState): ThumbnailState => {
  const encoded = encodePreset(state);
  const preset = decodePreset(`?p=${encoded}`);
  expect(preset).not.toBeNull();
  return applyPreset(preset as NonNullable<typeof preset>);
};

describe("preset links", () => {
  it("round-trips the default state of every mode", () => {
    for (const mode of ["profile", "portfolio", "intro"] as const) {
      const state = initialState(mode);
      const restored = roundTrip(state);
      expect({ ...restored, face: state.face, shot: state.shot }).toEqual({
        ...state,
        face: state.face,
        shot: state.shot,
      });
    }
  });

  it("round-trips a fully customised design", () => {
    let state = changeStyle(initialState("portfolio"), "spotlight");
    state = setField(state, "pill", "FEATURED PROJECT");
    state = setField(state, "headline", "Built for growth");
    state = {
      ...state,
      palette: "teal",
      size: "16x9",
      font: "Anton",
      arrow: true,
      play: false,
      playOffsetX: -20,
      playOffsetY: 35,
      calloutText: "Case study",
      overlayLabel: true,
      originalLayout: true,
      browserFrame: true,
      browserUrl: "demo-project.app",
      projectLabel: "Demo Project",
      portraitShape: "circle",
      backdrop: "clean",
      icons: ["chart", "bolt", "mail", "pen"],
      ring: {
        color: "#123456",
        preset: "custom",
        customColor: "#123456",
        gradient: true,
        thickness: 90,
        gap: "dark",
        backgroundMode: "gradient",
        background: "#15111F",
      },
    };
    const restored = roundTrip(state);
    expect({ ...restored, face: state.face, shot: state.shot }).toEqual(state);
  });

  it("keeps unicode words intact", () => {
    let state = changeStyle(initialState("intro"), "hello");
    state = setField(state, "name", "Priya M. — designer · “pro”");
    const restored = roundTrip(state);
    expect(restored.values).toEqual(state.values);
  });

  it("restores the per-mode style memory from the link", () => {
    let state = changeStyle(initialState("intro"), "banner");
    state = changeStyle(state, "proof");
    const restored = roundTrip(state);
    expect(restored.style).toBe("proof");
    expect(restored.lastStyle.intro).toBe("proof");
  });

  it("serialises bundled demo images and reloads their crop", () => {
    const state = changeStyle(initialState("portfolio"), "result");
    const withImage: ThumbnailState = {
      ...state,
      shot: {
        image: {} as HTMLImageElement,
        name: "shot-dashboard.jpg",
        zoom: 140,
        x: 20,
        y: 60,
        src: "/demo/shot-dashboard.jpg",
      },
    };
    const preset = decodePreset(`?p=${encodePreset(withImage)}`);
    expect(preset?.shot).toEqual({ src: "/demo/shot-dashboard.jpg", zoom: 140, x: 20, y: 60 });
    const restored = applyPreset(preset as NonNullable<typeof preset>);
    expect(restored.shot.image).toBeNull();
    expect(restored.shot.zoom).toBe(140);
    expect(restored.shot.x).toBe(20);
  });

  it("omits local uploads from the link", () => {
    const state: ThumbnailState = {
      ...initialState("profile"),
      face: { image: {} as HTMLImageElement, name: "me.jpg", zoom: 120, x: 50, y: 40 },
    };
    const preset = decodePreset(`?p=${encodePreset(state)}`);
    expect(preset?.face).toBeUndefined();
  });

  it("rejects malformed payloads", () => {
    expect(decodePreset("")).toBeNull();
    expect(decodePreset("?p=@@@")).toBeNull();
    expect(decodePreset(`?p=${btoa("not json")}`)).toBeNull();
    expect(decodePreset(`?p=${btoa('{"v":2}')}`)).toBeNull();
    expect(decodePreset("?other=1")).toBeNull();
    const mismatch = Buffer.from(JSON.stringify({ v: 1, mode: "intro", style: "result" })).toString(
      "base64",
    );
    expect(decodePreset(`?p=${mismatch}`)).toBeNull();
  });

  it("never loads remote or traversal images", () => {
    const pack = (src: string) =>
      Buffer.from(JSON.stringify({ v: 1, mode: "profile", style: "profile", face: { src } }))
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_");
    expect(decodePreset(`?p=${pack("https://evil.example/x.png")}`)?.face).toBeUndefined();
    expect(decodePreset(`?p=${pack("//evil.example/x.png")}`)?.face).toBeUndefined();
    expect(decodePreset(`?p=${pack("/../secret.png")}`)?.face).toBeUndefined();
    expect(decodePreset(`?p=${pack("/demo/face-01.png")}`)?.face?.src).toBe("/demo/face-01.png");
  });

  it("clamps and sanitises hostile field values", () => {
    const raw = {
      v: 1,
      mode: "portfolio",
      style: "result",
      palette: "neon",
      size: "poster",
      font: "Comic Sans",
      playOffsetX: 999,
      browserUrl: "x".repeat(500),
      calloutText: "bad",
      icons: ["code", "nope", 42, "bolt"],
      ring: { color: "red", thickness: 9999, gap: "wide" },
      values: { headline: "ok", "": "dropped" },
    };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    const preset = decodePreset(`?p=${encoded}`) as NonNullable<ReturnType<typeof decodePreset>>;
    expect(preset.palette).toBe("purple");
    expect(preset.size).toBe("4x3");
    expect(preset.font).toBe("original");
    expect(preset.playOffsetX).toBe(100);
    expect(preset.browserUrl).toHaveLength(48);
    expect(preset.calloutText).toBe("bad");
    expect(preset.icons).toEqual(["code", "bolt"]);
    expect(preset.ring.color).toBe("#8360F5");
    expect(preset.ring.thickness).toBe(110);
    expect(preset.ring.gap).toBe("white");
    expect(preset.values).toEqual({ headline: "ok" });
  });

  it("round-trips the loom overlay and play size, with safe defaults", () => {
    const state = {
      ...initialState("portfolio"),
      play: false,
      loom: true,
      loomVariant: "dark" as const,
      loomSize: 150,
    };
    const restored = roundTrip(state);
    expect(restored.loom).toBe(true);
    expect(restored.play).toBe(false);
    expect(restored.loomVariant).toBe("dark");
    expect(restored.loomSize).toBe(150);

    const raw = { v: 1, mode: "portfolio", style: "result" };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    const preset = decodePreset(`?p=${encoded}`);
    expect(preset?.loom).toBe(false);
    expect(preset?.play).toBe(true);
    expect(preset?.loomVariant).toBe("light");
    expect(preset?.playSize).toBe(100);

    const hostile = Buffer.from(
      JSON.stringify({ ...raw, loomVariant: "neon", playSize: 999 }),
    ).toString("base64");
    const cleaned = decodePreset(`?p=${hostile}`);
    expect(cleaned?.loomVariant).toBe("light");
    expect(cleaned?.playSize).toBe(200);

    const tiny = Buffer.from(JSON.stringify({ ...raw, loom: true, loomSize: 5 })).toString(
      "base64",
    );
    const small = decodePreset(`?p=${tiny}`);
    expect(small?.loom).toBe(true);
    expect(small?.play).toBe(false);
    expect(small?.loomSize).toBe(50);
  });

  it("round-trips the whole-button size, with safe defaults", () => {
    expect(roundTrip({ ...initialState("portfolio"), buttonSize: 175 }).buttonSize).toBe(175);

    const raw = { v: 1, mode: "portfolio", style: "result" };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    expect(decodePreset(`?p=${encoded}`)?.buttonSize).toBe(100);

    const hostile = Buffer.from(JSON.stringify({ ...raw, buttonSize: 999 })).toString("base64");
    expect(decodePreset(`?p=${hostile}`)?.buttonSize).toBe(200);
    const tiny = Buffer.from(JSON.stringify({ ...raw, buttonSize: 1 })).toString("base64");
    expect(decodePreset(`?p=${tiny}`)?.buttonSize).toBe(50);
  });

  it("round-trips the badge size and variant, with safe defaults", () => {
    expect(roundTrip({ ...initialState("portfolio"), badgeSize: 160 }).badgeSize).toBe(160);
    expect(roundTrip({ ...initialState("portfolio"), badgeVariant: "white" }).badgeVariant).toBe(
      "white",
    );

    const raw = { v: 1, mode: "portfolio", style: "casestudy" };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    expect(decodePreset(`?p=${encoded}`)?.badgeSize).toBe(100);
    expect(decodePreset(`?p=${encoded}`)?.badgeVariant).toBe("blue");

    const hostile = Buffer.from(
      JSON.stringify({ ...raw, badgeSize: 999, badgeVariant: "neon" }),
    ).toString("base64");
    expect(decodePreset(`?p=${hostile}`)?.badgeSize).toBe(200);
    expect(decodePreset(`?p=${hostile}`)?.badgeVariant).toBe("blue");
    const tiny = Buffer.from(JSON.stringify({ ...raw, badgeSize: 1 })).toString("base64");
    expect(decodePreset(`?p=${tiny}`)?.badgeSize).toBe(50);
  });

  it("reads legacy playIcon links as the loom overlay", () => {
    const raw = { v: 1, mode: "portfolio", style: "result", play: true, playIcon: "loom" };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    const preset = decodePreset(`?p=${encoded}`);
    expect(preset?.loom).toBe(true);
    expect(preset?.play).toBe(false);

    const triangle = Buffer.from(JSON.stringify({ ...raw, playIcon: "play" })).toString("base64");
    const playFirst = decodePreset(`?p=${triangle}`);
    expect(playFirst?.loom).toBe(false);
    expect(playFirst?.play).toBe(true);
  });

  it("round-trips the custom theme colour", () => {
    const state = {
      ...initialState("portfolio"),
      palette: "custom" as const,
      customPaletteColor: "#1D4ED8",
    };
    const restored = roundTrip(state);
    expect(restored.palette).toBe("custom");
    expect(restored.customPaletteColor).toBe("#1D4ED8");

    const raw = { v: 1, mode: "portfolio", style: "result", palette: "custom" };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    const preset = decodePreset(`?p=${encoded}`);
    expect(preset?.customPaletteColor).toBe("#2563EB");

    const bad = Buffer.from(JSON.stringify({ ...raw, customPaletteColor: "blue" })).toString(
      "base64",
    );
    expect(decodePreset(`?p=${bad}`)?.customPaletteColor).toBe("#2563EB");
  });

  it("keeps play on unless explicitly off", () => {
    const raw = { v: 1, mode: "portfolio", style: "result" };
    const encoded = Buffer.from(JSON.stringify(raw)).toString("base64");
    expect(decodePreset(`?p=${encoded}`)?.play).toBe(true);
    const off = Buffer.from(JSON.stringify({ ...raw, play: false })).toString("base64");
    expect(decodePreset(`?p=${off}`)?.play).toBe(false);
  });
});
