"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  quoteImageShown,
  setTune,
  type ThumbnailState,
  tune,
  tuneText,
} from "@/lib/thumbnail/model";

interface Props {
  state: ThumbnailState;
  setState: Dispatch<SetStateAction<ThumbnailState>>;
}
interface Slider {
  key: string;
  label: string;
  min: number;
  max: number;
  fallback: number;
  unit: string;
}
const size = (key: string, label: string): Slider => ({
  key,
  label,
  min: 50,
  max: 200,
  fallback: 100,
  unit: "%",
});
const move = (key: string, label: string): Slider => ({
  key,
  label,
  min: -100,
  max: 100,
  fallback: 0,
  unit: "",
});
const GROUPS: { title: string; sliders: Slider[] }[] = [
  {
    title: "Heading",
    sliders: [
      size("titleSize", "Size"),
      move("titleX", "Left / right"),
      move("titleY", "Up / down"),
    ],
  },
  {
    title: "Quotation mark",
    sliders: [size("markSize", "Size"), move("markX", "Left / right"), move("markY", "Up / down")],
  },
  {
    title: "Review text",
    sliders: [
      size("quoteSize", "Size"),
      move("quoteX", "Left / right"),
      move("quoteY", "Up / down"),
    ],
  },
  {
    title: "Client name and project",
    sliders: [size("authorSize", "Size (name and project together)")],
  },
  { title: "Rating", sliders: [size("starSize", "Star size")] },
];
const STAR_STYLES = [
  ["yellow", "Yellow"],
  ["black", "Black"],
  ["white", "White"],
] as const;

export function QuoteControls({ state, setState }: Props): React.JSX.Element {
  const review = state.style === "review";
  const mode = tuneText(state, "ratingMode", review ? "stars" : "number");
  const starStyle = tuneText(state, "starStyle", "yellow");
  const set = (key: string, value: string | number) =>
    setState((current) => setTune(current, key, value));
  return (
    <fieldset className="field">
      <legend>{review ? "Client review layout" : "Client quote layout"}</legend>
      <label className="toggle">
        <span>Show image</span>
        <input
          type="checkbox"
          checked={quoteImageShown(state)}
          onChange={(event) => set("showImage", event.currentTarget.checked ? "1" : "0")}
        />
      </label>
      <p className="helper">Turn the image off and the text uses the full width.</p>
      <fieldset className="segments" aria-label="Rating display">
        {(
          [
            ["stars", "Show stars"],
            ["number", "Show number"],
          ] as const
        ).map(([id, name]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => set("ratingMode", id)}
          >
            {name}
          </button>
        ))}
      </fieldset>
      {mode === "stars" && (
        <fieldset className="segments" aria-label="Star colour">
          {STAR_STYLES.map(([id, name]) => (
            <button
              key={id}
              type="button"
              aria-pressed={starStyle === id}
              onClick={() => set("starStyle", id)}
            >
              {name} stars
            </button>
          ))}
        </fieldset>
      )}
      {GROUPS.map((group) => (
        <fieldset className="field" key={group.title}>
          <legend>{group.title}</legend>
          {group.sliders.map((slider) => {
            const value = tune(state, slider.key, slider.fallback);
            return (
              <label className="range-control" key={slider.key}>
                <span className="field-label">
                  {slider.label} <output>{`${value}${slider.unit}`}</output>
                </span>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.unit ? 5 : 1}
                  value={value}
                  aria-label={`${group.title} ${slider.label}`}
                  onChange={(event) => set(slider.key, event.currentTarget.value)}
                />
              </label>
            );
          })}
        </fieldset>
      ))}
      <p className="helper">Edit the words under "4. Your words". 100% is the default size.</p>
    </fieldset>
  );
}
