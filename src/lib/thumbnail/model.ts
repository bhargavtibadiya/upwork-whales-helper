export type Mode = "profile" | "portfolio" | "intro";
export type Style =
  | "profile"
  | "result"
  | "stat"
  | "reviews"
  | "meet"
  | "banner"
  | "hello"
  | "proof";
export type Palette = "purple" | "green" | "blue" | "black";
export type ImageKind = "face" | "shot";
export interface Crop {
  image: HTMLImageElement | null;
  name: string;
  zoom: number;
  x: number;
  y: number;
}
export interface Ring {
  color: string;
  preset: string;
  customColor: string;
  gradient: boolean;
  thickness: number;
  gap: "white" | "dark" | "none";
  backgroundMode: "keep" | "solid" | "gradient";
  background: string;
}
export interface ThumbnailState {
  mode: Mode;
  style: Style;
  lastStyle: Record<Mode, Style>;
  palette: Palette;
  size: "4x3" | "16x9";
  values: Record<string, string>;
  icons: string[];
  face: Crop;
  shot: Crop;
  arrow: boolean;
  play: boolean;
  ring: Ring;
}
export interface StyleSpec {
  id: Style;
  mode: Mode;
  name: string;
  fields: string[];
  images: ImageKind[];
  extras: ("arrow" | "play")[];
  defaults: Record<string, string>;
  labels: Record<string, string>;
  statCount?: number;
}
export const STYLES: StyleSpec[] = [
  {
    id: "profile",
    mode: "profile",
    name: "Ringed profile picture",
    fields: [],
    images: ["face"],
    extras: [],
    defaults: {},
    labels: {},
  },
  {
    id: "result",
    mode: "portfolio",
    name: "Result + screenshot",
    fields: ["pill", "headline", "subline"],
    images: ["shot"],
    extras: ["play", "arrow"],
    defaults: { pill: "WATCH THIS", headline: "120K CLICKS", subline: "" },
    labels: {
      pill: "Button text",
      headline: "Big result",
      subline: "Small line under it (optional)",
    },
  },
  {
    id: "stat",
    mode: "portfolio",
    name: "Face + big stat",
    fields: ["pill", "headline", "subline", "stats", "services"],
    images: ["face"],
    extras: ["play"],
    defaults: {
      pill: "WATCH THIS",
      headline: "120K",
      subline: "Organic Clicks Delivered",
      stat1v: "4.2M",
      stat1l: "Impressions",
      stat2v: "900+",
      stat2l: "Daily Clicks",
      services: "SEO · Google Ads · Content Writing",
    },
    labels: {
      pill: "Top text",
      headline: "Big number",
      subline: "What the number means",
      services: "Services line",
    },
  },
  {
    id: "reviews",
    mode: "portfolio",
    name: "Client results",
    fields: ["headline", "subline", "badge", "stats", "pill"],
    images: ["face"],
    extras: ["play", "arrow"],
    defaults: {
      headline: "CLIENT RESULTS",
      subline: "& REVIEWS",
      badge: "TOP RATED",
      stat1v: "$20K+",
      stat1l: "Total earned",
      stat2v: "100%",
      stat2l: "Job success",
      pill: "Click to watch",
    },
    labels: {
      headline: "Title line 1",
      subline: "Title line 2 (coloured)",
      badge: "Badge (leave empty to hide)",
      pill: "Button text",
    },
  },
  {
    id: "meet",
    mode: "intro",
    name: "Meet me",
    fields: ["headline", "name", "role"],
    images: ["face", "shot"],
    extras: ["arrow", "play"],
    defaults: { headline: "CLICK HERE", name: "Alex R.", role: "AI Automation Specialist" },
    labels: { headline: "Big text", name: "Your name", role: "What you do" },
  },
  {
    id: "banner",
    mode: "intro",
    name: "Title banner",
    fields: ["headline", "headline2", "subline", "chips", "badge", "badge2"],
    images: ["face"],
    extras: [],
    defaults: {
      headline: "FULL STACK",
      headline2: "AI DEVELOPER",
      subline: "From idea to launch",
      chip1: "Web apps",
      chip2: "Backend",
      chip3: "AI agents",
      chip4: "Integrations",
      badge: "TOP RATED",
      badge2: "100% Job Success",
    },
    labels: {
      headline: "Title line 1",
      headline2: "Title line 2 (coloured)",
      subline: "Tagline (small bar, optional)",
      badge: "Badge line 1",
      badge2: "Badge line 2",
    },
  },
  {
    id: "hello",
    mode: "intro",
    name: "Big hello",
    fields: ["headline", "name", "role"],
    images: ["face"],
    extras: [],
    defaults: { headline: "hi", name: "Alex R.", role: "AI Automation Specialist" },
    labels: { headline: "Big hello word", name: "Your name", role: "What you do (one line)" },
  },
  {
    id: "proof",
    mode: "intro",
    name: "Watch this + proof",
    fields: ["pill", "stats", "services"],
    images: ["face"],
    extras: ["play"],
    statCount: 3,
    defaults: {
      pill: "WATCH THIS",
      stat1v: "50+",
      stat1l: "Projects delivered",
      stat2v: "5.0",
      stat2l: "Client rating",
      stat3v: "$100K+",
      stat3l: "Earned on Upwork",
      services: "AI Agents · Automation · Web Apps",
    },
    labels: { pill: "Top text", services: "Tools or services bar (optional)" },
  },
];
const SHARED = new Set([
  "name",
  "role",
  "badge",
  "badge2",
  "services",
  "stat1v",
  "stat1l",
  "stat2v",
  "stat2l",
  "stat3v",
  "stat3l",
  "chip1",
  "chip2",
  "chip3",
  "chip4",
]);
export function spec(style: Style): StyleSpec {
  const found = STYLES.find((item) => item.id === style);
  if (!found) throw new Error("Unknown style");
  return found;
}
export function valueKey(style: Style, key: string): string {
  return SHARED.has(key) ? key : `${style}:${key}`;
}
export function fieldValue(state: ThumbnailState, key: string, style: Style = state.style): string {
  return state.values[valueKey(style, key)] ?? spec(style).defaults[key] ?? "";
}
export function setField(state: ThumbnailState, key: string, value: string): ThumbnailState {
  return { ...state, values: { ...state.values, [valueKey(state.style, key)]: value } };
}
export function changeMode(state: ThumbnailState, mode: Mode): ThumbnailState {
  return { ...state, mode, style: state.lastStyle[mode] };
}
export function changeStyle(state: ThumbnailState, style: Style): ThumbnailState {
  const mode = spec(style).mode;
  return { ...state, mode, style, lastStyle: { ...state.lastStyle, [mode]: style } };
}
export function dimensions(state: ThumbnailState): readonly [number, number] {
  return state.mode === "profile"
    ? [1000, 1000]
    : state.mode === "intro" || state.size === "16x9"
      ? [1280, 720]
      : [1000, 750];
}
export function initialState(mode: Mode = "portfolio"): ThumbnailState {
  return {
    mode,
    style: mode === "profile" ? "profile" : mode === "intro" ? "meet" : "result",
    lastStyle: { profile: "profile", portfolio: "result", intro: "meet" },
    palette: "purple",
    size: "4x3",
    values: {},
    icons: ["code", "database", "ai", "cloud"],
    face: { image: null, name: "", zoom: 100, x: 50, y: 30 },
    shot: { image: null, name: "", zoom: 100, x: 50, y: 0 },
    arrow: true,
    play: true,
    ring: {
      color: "#8360F5",
      preset: "whales",
      customColor: "#F5A524",
      gradient: false,
      thickness: 50,
      gap: "white",
      backgroundMode: "keep",
      background: "#E9EAEE",
    },
  };
}
export interface ModeSpec {
  id: Mode;
  name: string;
  description: string;
}
export const MODES: ModeSpec[] = [
  { id: "profile", name: "Profile picture", description: "Your Upwork photo, with a ring" },
  { id: "portfolio", name: "Portfolio thumbnail", description: "For a project in your portfolio" },
  { id: "intro", name: "Intro video thumbnail", description: "For the video on your profile" },
];
