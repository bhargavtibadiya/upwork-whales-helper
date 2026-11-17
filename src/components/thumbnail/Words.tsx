"use client";

import type { Dispatch, SetStateAction } from "react";
import { fieldValue, setField, spec, type ThumbnailState } from "@/lib/thumbnail/model";

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
  quote: 90,
};
interface WordsProps {
  state: ThumbnailState;
  setState: Dispatch<SetStateAction<ThumbnailState>>;
}
export function Words({ state, setState }: WordsProps): React.JSX.Element | null {
  const style = spec(state.style);
  if (!style.fields.length) return null;
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
            {input(key, style.labels[key] ?? key, LIMITS[key] ?? 60)}
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
              <p className="helper">One or two short sentences from a real client work best.</p>
            )}
            {key === "badge2" && (
              <p className="helper">Leave both badge lines empty to hide the badge.</p>
            )}
          </div>
        ),
      )}
    </section>
  );
}
