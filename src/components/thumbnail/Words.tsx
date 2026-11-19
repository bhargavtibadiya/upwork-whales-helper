"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  fieldValue,
  QUOTE_STYLES,
  setField,
  setTune,
  spec,
  type ThumbnailState,
  tune,
  tuneText,
} from "@/lib/thumbnail/model";

const ICONS = [
  ["code", "Code"],
  ["database", "Database"],
  ["ai", "AI sparkle"],
  ["cloud", "Cloud"],
  ["chart", "Chart"],
  ["chat", "Chat"],
  ["mobile", "Mobile"],
  ["gear", "Settings"],
  ["search", "Search"],
  ["mail", "Email"],
  ["bolt", "Lightning"],
  ["video", "Video"],
  ["cart", "Shop"],
  ["pen", "Pen"],
  ["check", "Tick"],
];
const LIMITS: Record<string, number> = {
  pill: 22,
  headline: 24,
  headline2: 24,
  name: 22,
  role: 40,
  subline: 60,
  badge: 18,
  badge2: 18,
  services: 60,
  quote: 225,
  title: 28,
  project: 40,
};
const REVIEW_QUOTE_LIMIT = 450;

interface WordsProps {
  state: ThumbnailState;
  setState: Dispatch<SetStateAction<ThumbnailState>>;
}

interface SliderMeta {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  fallback: number;
  unit: string;
}
const sizeSlider = (key: string, label: string): SliderMeta => ({
  key,
  label,
  min: 50,
  max: 200,
  step: 5,
  fallback: 100,
  unit: "%",
});
const moveSlider = (key: string, label: string): SliderMeta => ({
  key,
  label,
  min: -100,
  max: 100,
  step: 1,
  fallback: 0,
  unit: "",
});

function TuneGroup({ title, children }: { title: string; children: ReactNode }): React.JSX.Element {
  return (
    <fieldset className="tune-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

function TuneSlider({
  state,
  setState,
  meta,
  group,
}: WordsProps & { meta: SliderMeta; group: string }): React.JSX.Element {
  const value = tune(state, meta.key, meta.fallback);
  return (
    <label className="range-control">
      <span className="field-label">
        {meta.label} <output>{`${value}${meta.unit}`}</output>
      </span>
      <input
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        aria-label={`${group} ${meta.label}`}
        onChange={(event) =>
          setState((current) => setTune(current, meta.key, event.currentTarget.value))
        }
      />
    </label>
  );
}

function TuneSliders({
  state,
  setState,
  title,
  sliders,
}: WordsProps & { title: string; sliders: SliderMeta[] }): React.JSX.Element {
  return (
    <TuneGroup title={title}>
      {sliders.map((meta) => (
        <TuneSlider key={meta.key} state={state} setState={setState} meta={meta} group={title} />
      ))}
    </TuneGroup>
  );
}

const STAR_STYLES = [
  ["yellow", "Yellow"],
  ["black", "Black"],
  ["white", "White"],
] as const;

function RatingControls({ state, setState }: WordsProps): React.JSX.Element {
  const review = state.style === "review";
  const mode = tuneText(state, "ratingMode", review ? "stars" : "number");
  const starStyle = tuneText(state, "starStyle", "yellow");
  const set = (key: string, value: string | number) =>
    setState((current) => setTune(current, key, value));
  return (
    <TuneGroup title="Rating">
      <span className="field-label">Show the rating as</span>
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
        <>
          <span className="field-label">Star colour</span>
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
        </>
      )}
      <TuneSlider
        state={state}
        setState={setState}
        meta={sizeSlider("starSize", "Star size")}
        group="Rating"
      />
    </TuneGroup>
  );
}

const BADGE_VARIANTS = [
  { id: "blue", name: "Blue" },
  { id: "dark", name: "Dark" },
  { id: "white", name: "White" },
] as const;

function BadgeControls({ state, setState }: WordsProps): React.JSX.Element {
  return (
    <TuneGroup title="Badge">
      <span className="field-label">Badge style</span>
      <fieldset className="segments" aria-label="Badge style">
        {BADGE_VARIANTS.map((variant) => (
          <button
            key={variant.id}
            type="button"
            aria-pressed={state.badgeVariant === variant.id}
            onClick={() => setState((current) => ({ ...current, badgeVariant: variant.id }))}
          >
            {variant.name}
          </button>
        ))}
      </fieldset>
      <label className="range-control">
        <span className="field-label">
          Badge size <output>{state.badgeSize}%</output>
        </span>
        <input
          type="range"
          min={50}
          max={200}
          step={5}
          value={state.badgeSize}
          aria-label="Badge size"
          onChange={(event) => {
            const badgeSize = Number(event.currentTarget.value);
            setState((current) => ({ ...current, badgeSize }));
          }}
        />
      </label>
    </TuneGroup>
  );
}

export function Words({ state, setState }: WordsProps): React.JSX.Element | null {
  const style = spec(state.style);
  if (!style.fields.length) return null;
  const quoteStyle = QUOTE_STYLES.includes(state.style);
  const review = state.style === "review";
  const input = (key: string, label: string, limit: number) => (
    <input
      id={`word-${key}`}
      type="text"
      aria-label={label}
      maxLength={limit}
      autoComplete="off"
      value={fieldValue(state, key)}
      onChange={(event) => {
        const value = event.currentTarget.value;
        setState((current) => setField(current, key, value));
      }}
    />
  );
  return (
    <section className="surface words">
      <h2>4. Your words</h2>
      <p className="helper">
        Text and stats are examples. Replace them with your own accurate details before exporting.
      </p>
      <div className="field">
        <label htmlFor="artwork-font">Artwork font</label>
        <select
          id="artwork-font"
          value={state.font}
          onChange={(event) => {
            const font = event.currentTarget.value as ThumbnailState["font"];
            setState((current) => ({ ...current, font }));
          }}
        >
          <option value="original">Original pairing</option>
          <option value="Montserrat">Montserrat · geometric</option>
          <option value="Manrope">Manrope · clean</option>
          <option value="Anton">Anton · condensed</option>
        </select>
        <p className="helper">
          Google Fonts, served locally. Applies to the artwork, not the editor.
        </p>
      </div>
      {style.fields.map((key) =>
        key === "stats" ? (
          <fieldset className="field" key={key}>
            <legend>
              Small stats <span className="helper">(number, then what it is)</span>
            </legend>
            {Array.from({ length: style.statCount ?? 3 }, (_, index) => {
              const n = index + 1;
              return (
                <div className="field-pair" key={n}>
                  {input(`stat${n}v`, `Stat ${n} number`, 10)}
                  {input(`stat${n}l`, `Stat ${n} label`, 20)}
                </div>
              );
            })}
            <p className="helper">Leave a row empty to hide it.</p>
          </fieldset>
        ) : key === "chips" ? (
          <fieldset className="field" key={key}>
            <legend>
              Skill icons <span className="helper">(pick an icon, then type the label)</span>
            </legend>
            {[1, 2, 3, 4].map((n) => (
              <div className="field-pair" key={n}>
                <select
                  aria-label={`Skill ${n} icon`}
                  value={state.icons[n - 1]}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setState((current) => ({
                      ...current,
                      icons: current.icons.map((icon, i) => (i === n - 1 ? value : icon)),
                    }));
                  }}
                >
                  {ICONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {input(`chip${n}`, `Skill ${n} label`, 18)}
              </div>
            ))}
            <p className="helper">Leave a label empty to hide that icon.</p>
          </fieldset>
        ) : (
          <div className="field" key={key}>
            <label htmlFor={`word-${key}`}>{style.labels[key] ?? key}</label>
            {key === "quote" && quoteStyle ? (
              <textarea
                id={`word-${key}`}
                aria-label={style.labels[key] ?? key}
                maxLength={review ? REVIEW_QUOTE_LIMIT : LIMITS.quote}
                rows={review ? 6 : 4}
                value={fieldValue(state, key)}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setState((current) => setField(current, key, value));
                }}
              />
            ) : (
              input(key, style.labels[key] ?? key, LIMITS[key] ?? 60)
            )}
            {key === "headline" && state.style === "casestudy" && (
              <p className="helper">Three or four words read best at thumbnail size.</p>
            )}
            {key === "headline" && state.style === "result" && (
              <p className="helper">Keep it short: a number and a word works best.</p>
            )}
            {key === "headline" && state.style === "stat" && (
              <p className="helper">Just the number, like 120K or $48K.</p>
            )}
            {key === "headline" && state.style === "hello" && (
              <p className="helper">Short and friendly: hi, hey or hello.</p>
            )}
            {key === "headline2" && (
              <p className="helper">Your job title works well split over two lines.</p>
            )}
            {key === "services" && (
              <p className="helper">Separate with a dot: · (or just use commas)</p>
            )}
            {key === "quote" && (
              <p className="helper">
                {review
                  ? "Up to 450 characters. The text shrinks to fit; use the size slider to adjust."
                  : "Up to 225 characters. A short real client quote reads best."}
              </p>
            )}
            {key === "badge2" && (
              <p className="helper">Leave both badge lines empty to hide the badge.</p>
            )}
            {quoteStyle && key === "title" && (
              <TuneSliders
                state={state}
                setState={setState}
                title="Heading"
                sliders={[
                  sizeSlider("titleSize", "Size"),
                  moveSlider("titleX", "Left / right"),
                  moveSlider("titleY", "Up / down"),
                ]}
              />
            )}
            {quoteStyle && key === "quote" && (
              <>
                <TuneSliders
                  state={state}
                  setState={setState}
                  title="Quotation mark"
                  sliders={[
                    sizeSlider("markSize", "Size"),
                    moveSlider("markX", "Left / right"),
                    moveSlider("markY", "Up / down"),
                  ]}
                />
                <TuneSliders
                  state={state}
                  setState={setState}
                  title={review ? "Review text" : "Quote text"}
                  sliders={[
                    sizeSlider("quoteSize", "Size"),
                    moveSlider("quoteX", "Left / right"),
                    moveSlider("quoteY", "Up / down"),
                  ]}
                />
              </>
            )}
            {quoteStyle && key === "project" && (
              <TuneSliders
                state={state}
                setState={setState}
                title="Client name and project"
                sliders={[sizeSlider("authorSize", "Size (name and project together)")]}
              />
            )}
            {quoteStyle && key === "badge" && <RatingControls state={state} setState={setState} />}
            {state.style === "casestudy" && key === "badge2" && (
              <BadgeControls state={state} setState={setState} />
            )}
          </div>
        ),
      )}
    </section>
  );
}
