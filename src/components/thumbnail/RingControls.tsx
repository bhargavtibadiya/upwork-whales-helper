"use client";

import { customRingGradient } from "@/lib/thumbnail/brush";
import { BACKGROUNDS, RING_COLORS, type Ring, type ThumbnailState } from "@/lib/thumbnail/model";

interface RingProps {
  state: ThumbnailState;
  onRing: (patch: Partial<Ring>) => void;
}
export function RingControls({ state, onRing }: RingProps): React.JSX.Element {
  const ring = state.ring;
  return (
    <>
      <p className="helper mb-4">
        Colour the ring for your current badge: Top Rated is blue, Top Rated Plus is pink. It looks
        good with the Available Now badge.
      </p>
      <fieldset className="ring-options" aria-label="Ring colour">
        {RING_COLORS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="choice ring-option"
            aria-pressed={ring.preset === item.id}
            onClick={() => onRing({ preset: item.id, color: item.color })}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <defs>
                <linearGradient id={`ring-${item.id}`}>
                  <stop stopColor={item.gradient[0]} />
                  <stop offset="1" stopColor={item.gradient[1]} />
                </linearGradient>
              </defs>
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke={ring.gradient ? `url(#ring-${item.id})` : item.color}
                strokeWidth="8"
              />
            </svg>
            <span>{item.name}</span>
          </button>
        ))}
        <label
          className={`choice ring-option custom-color ${ring.preset === "custom" ? "is-selected" : ""}`}
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <defs>
              <linearGradient id="ring-custom">
                <stop stopColor={customRingGradient(ring.customColor)[0]} />
                <stop offset="1" stopColor={customRingGradient(ring.customColor)[1]} />
              </linearGradient>
            </defs>
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke={ring.gradient ? "url(#ring-custom)" : ring.customColor}
              strokeWidth="8"
            />
            <path d="M17 24h14m-7-7v14" />
          </svg>
          <span>Custom</span>
          <input
            type="color"
            aria-label="Custom ring colour"
            value={ring.customColor}
            onChange={(event) =>
              onRing({
                preset: "custom",
                color: event.currentTarget.value,
                customColor: event.currentTarget.value,
              })
            }
          />
        </label>
      </fieldset>
      <label className="toggle mt-4">
        <span>Gradient ring</span>
        <input
          type="checkbox"
          checked={ring.gradient}
          onChange={(event) => onRing({ gradient: event.currentTarget.checked })}
        />
      </label>
      <label className="range-control">
        <span className="field-label">
          Ring thickness{" "}
          <output>{ring.thickness < 36 ? "Thin" : ring.thickness < 72 ? "Medium" : "Thick"}</output>
        </span>
        <input
          aria-label="Ring thickness"
          type="range"
          min="18"
          max="110"
          value={ring.thickness}
          onChange={(event) => onRing({ thickness: Number(event.currentTarget.value) })}
        />
      </label>
      <div className="mt-4">
        <span className="field-label">Gap between ring and photo</span>
        <fieldset className="segments" aria-label="Gap between ring and photo">
          {(
            [
              { id: "none", label: "No gap" },
              { id: "white", label: "White gap" },
              { id: "dark", label: "Dark gap" },
            ] as const
          ).map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={ring.gap === item.id}
              onClick={() => onRing({ gap: item.id })}
            >
              {item.label}
            </button>
          ))}
        </fieldset>
      </div>
    </>
  );
}
export function BackgroundControls({ state, onRing }: RingProps): React.JSX.Element {
  const ring = state.ring;
  return (
    <section className="surface">
      <h2>3. Background</h2>
      <p className="helper mb-4">
        Keep the background in your photo, or put a colour behind a cut-out PNG.
      </p>
      <fieldset className="segments" aria-label="Photo background">
        {(
          [
            { id: "keep", label: "Keep photo" },
            { id: "solid", label: "Solid colour" },
            { id: "gradient", label: "Soft gradient" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={ring.backgroundMode === item.id}
            onClick={() => onRing({ backgroundMode: item.id })}
          >
            {item.label}
          </button>
        ))}
      </fieldset>
      {ring.backgroundMode !== "keep" && (
        <>
          <fieldset className="background-options" aria-label="Background colour">
            {BACKGROUNDS.map((item) => (
              <button
                type="button"
                key={item.name}
                aria-label={item.name}
                title={item.name}
                aria-pressed={ring.background.toLowerCase() === item.color.toLowerCase()}
                onClick={() => onRing({ background: item.color })}
              >
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="20" r="17" fill={item.color} />
                </svg>
              </button>
            ))}
            <label className="custom-color">
              <span className="sr-only">Custom background colour</span>
              <input
                aria-label="Custom background colour"
                type="color"
                value={ring.background}
                onChange={(event) => onRing({ background: event.currentTarget.value })}
              />
            </label>
          </fieldset>
          <p className="tip">
            A new background shows through transparent parts of a cut-out PNG. It does not remove
            the existing background from a JPG.
          </p>
        </>
      )}
    </section>
  );
}
