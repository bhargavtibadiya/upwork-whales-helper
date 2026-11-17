export type Mode = "profile" | "portfolio" | "intro";
export type Style =
  | "profile"
  | "result"
  | "stat"
  | "reviews"
  | "quote"
  | "checklist"
  | "cover"
  | "duo"
  | "meet"
  | "banner"
  | "hello"
  | "proof"
  | "split"
  | "centered"
  | "statline"
  | "tagline"
  | "spotlight"
  | "beforeafter"
  | "minimal"
  | "editorial"
  | "signature";
export type Palette = "purple" | "green" | "blue" | "black" | "red" | "orange" | "teal" | "pink";
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
  calloutText: string;
  font: "original" | "Montserrat" | "Manrope" | "Anton";
  overlayLabel: boolean;
  originalLayout: boolean;
  browserFrame: boolean;
  portraitShape: "rounded" | "square" | "circle";
  backdrop: "glow" | "clean";
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
    statCount: 3,
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
      stat3v: "3×",
      stat3l: "Growth",
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
    fields: ["pill", "headline", "subline", "badge", "stats"],
    statCount: 3,
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
      stat3v: "50+",
      stat3l: "Projects",
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
    id: "quote",
    mode: "portfolio",
    name: "Client quote",
    fields: ["quote", "name", "badge"],
    images: ["face"],
    extras: ["play"],
    defaults: {
      quote: "Your client quote here",
      name: "Client name",
      badge: "",
    },
    labels: {
      quote: "Client quote",
      name: "Client name",
      badge: "Client rating (optional)",
    },
  },
  {
    id: "checklist",
    mode: "portfolio",
    name: "Service blueprint",
    fields: ["headline", "services"],
    images: ["face"],
    extras: ["arrow"],
    defaults: {
      headline: "WHAT YOU GET",
      services: "Web app · API · Database · Launch",
    },
    labels: {
      headline: "Title",
      services: "Checklist items, separated by ·",
    },
  },
  {
    id: "cover",
    mode: "portfolio",
    name: "Project cover",
    fields: ["pill", "headline", "subline"],
    images: ["shot"],
    extras: ["play", "arrow"],
    defaults: {
      pill: "CASE STUDY",
      headline: "SaaS Dashboard",
      subline: "Next.js · Stripe · Postgres",
    },
    labels: {
      pill: "Top label",
      headline: "Project name",
      subline: "Small line under it (optional)",
    },
  },
  {
    id: "duo",
    mode: "portfolio",
    name: "Impact report",
    fields: ["headline", "subline", "stats"],
    statCount: 3,
    images: ["face"],
    extras: ["play"],
    defaults: {
      headline: "120K CLICKS",
      subline: "Delivered in 90 days",
      stat1v: "4.2M",
      stat1l: "Impressions",
      stat2v: "900+",
      stat2l: "Daily Clicks",
      stat3v: "3×",
      stat3l: "Growth",
    },
    labels: {
      headline: "Big result",
      subline: "What the result means",
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
  {
    id: "split",
    mode: "intro",
    name: "Split intro",
    fields: ["pill", "name", "role"],
    images: ["face"],
    extras: ["play", "arrow"],
    defaults: { pill: "WATCH THIS", name: "Alex R.", role: "AI Automation Specialist" },
    labels: { pill: "Button text", name: "Your name", role: "What you do" },
  },
  {
    id: "centered",
    mode: "intro",
    name: "Center stage",
    fields: ["headline", "name", "role"],
    images: ["face"],
    extras: ["play"],
    defaults: { headline: "HI, I'M", name: "Alex R.", role: "AI Automation Specialist" },
    labels: { headline: "Small intro line", name: "Your name", role: "What you do" },
  },
  {
    id: "statline",
    mode: "intro",
    name: "Stats strip",
    fields: ["headline", "stats", "services"],
    images: ["face"],
    extras: ["play"],
    statCount: 3,
    defaults: {
      headline: "RESULTS THAT SPEAK",
      stat1v: "50+",
      stat1l: "Projects delivered",
      stat2v: "5.0",
      stat2l: "Client rating",
      stat3v: "$100K+",
      stat3l: "Earned on Upwork",
      services: "AI Agents · Automation · Web Apps",
    },
    labels: { headline: "Big text", services: "Bottom line (optional)" },
  },
  {
    id: "tagline",
    mode: "intro",
    name: "Title + skills",
    fields: ["headline", "headline2", "chips"],
    images: ["face"],
    extras: ["arrow"],
    defaults: {
      headline: "FULL STACK",
      headline2: "DEVELOPER",
      chip1: "Web apps",
      chip2: "AI agents",
      chip3: "APIs",
      chip4: "Cloud",
    },
    labels: {
      headline: "Title line 1",
      headline2: "Title line 2 (coloured)",
    },
  },
  {
    id: "spotlight",
    mode: "portfolio",
    name: "Project spotlight",
    fields: ["pill", "headline", "subline"],
    images: ["shot", "face"],
    extras: ["arrow", "play"],
    defaults: {
      pill: "FEATURED PROJECT",
      headline: "Built for growth",
      subline: "Strategy · Design · Development",
    },
    labels: { pill: "Project label", headline: "Project headline", subline: "Supporting line" },
  },
  {
    id: "beforeafter",
    mode: "portfolio",
    name: "The transformation",
    fields: ["headline", "headline2", "subline", "stats"],
    images: ["shot"],
    extras: ["arrow", "play"],
    statCount: 3,
    defaults: {
      headline: "FROM IDEA",
      headline2: "TO IMPACT",
      subline: "A better experience, built from scratch",
      stat1v: "3×",
      stat1l: "Faster",
      stat2v: "98",
      stat2l: "Performance",
      stat3v: "50+",
      stat3l: "Screens",
    },
    labels: { headline: "First line", headline2: "Accent line", subline: "Supporting line" },
  },
  {
    id: "minimal",
    mode: "portfolio",
    name: "Minimal showcase",
    fields: ["pill", "headline", "subline"],
    images: ["shot"],
    extras: ["arrow", "play"],
    defaults: {
      pill: "SELECTED WORK",
      headline: "Less noise. More impact.",
      subline: "A product experience that works",
    },
    labels: { pill: "Small label", headline: "Headline", subline: "Supporting line" },
  },
  {
    id: "editorial",
    mode: "intro",
    name: "The specialist",
    fields: ["pill", "name", "role", "services"],
    images: ["face"],
    extras: ["arrow", "play"],
    defaults: {
      pill: "MEET YOUR DEVELOPER",
      name: "Alex R.",
      role: "Full-stack developer",
      services: "Web apps · APIs · AI",
    },
    labels: {
      pill: "Small intro",
      name: "Your name",
      role: "What you do",
      services: "Specialties",
    },
  },
  {
    id: "signature",
    mode: "intro",
    name: "Personal brand",
    fields: ["headline", "name", "role", "stats"],
    images: ["face"],
    extras: ["arrow", "play"],
    statCount: 3,
    defaults: {
      headline: "YOUR NEXT PARTNER",
      name: "Alex R.",
      role: "Ideas into products.",
      stat1v: "50+",
      stat1l: "Projects",
      stat2v: "5.0",
      stat2l: "Rating",
      stat3v: "3+",
      stat3l: "Years",
    },
    labels: { headline: "Small intro", name: "Your name", role: "Your promise" },
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
    calloutText: "Watch this",
    font: "original",
    overlayLabel: false,
    originalLayout: false,
    browserFrame: false,
    portraitShape: "rounded",
    backdrop: "glow",
    arrow: false,
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

export const RING_COLORS = [
  { id: "toprated", name: "Top Rated", color: "#2563EB", gradient: ["#4D94F8", "#1F57C3"] },
  { id: "trplus", name: "Top Rated Plus", color: "#E3247B", gradient: ["#F45AA0", "#BF1363"] },
  { id: "whales", name: "Whales purple", color: "#8360F5", gradient: ["#A184FF", "#6D3EF0"] },
  { id: "rising", name: "Rising Talent", color: "#14A800", gradient: ["#3EC520", "#0D8A00"] },
  { id: "gold", name: "Gold", color: "#F5A524", gradient: ["#FFC53D", "#D9850B"] },
  { id: "red", name: "Red", color: "#E11D48", gradient: ["#F8547C", "#B4123A"] },
  { id: "teal", name: "Teal", color: "#0D9488", gradient: ["#2DD4BF", "#0F766E"] },
  { id: "orange", name: "Orange", color: "#EA580C", gradient: ["#FB923C", "#C2410C"] },
] as const;
export const PALETTES: { id: Palette; name: string }[] = [
  { id: "purple", name: "Whales purple" },
  { id: "green", name: "Green" },
  { id: "blue", name: "Blue" },
  { id: "black", name: "Black" },
  { id: "red", name: "Red" },
  { id: "orange", name: "Orange" },
  { id: "teal", name: "Teal" },
  { id: "pink", name: "Pink" },
];
export const BACKGROUNDS = [
  { name: "White", color: "#FFFFFF" },
  { name: "Light grey", color: "#E9EAEE" },
  { name: "Soft lavender", color: "#E6DEFF" },
  { name: "Soft mint", color: "#DDF3E6" },
  { name: "Dark", color: "#15111F" },
];
