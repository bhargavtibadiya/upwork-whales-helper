"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ARTWORK_PALETTES } from "@/lib/thumbnail/brush";
import {
  type Crop,
  changeMode,
  changeStyle,
  dimensions,
  type ImageKind,
  initialState,
  MODES,
  type Mode,
  PALETTES,
  type Ring,
  STYLES,
  spec,
  type ThumbnailState,
} from "@/lib/thumbnail/model";
import { artworkFonts, drawThumbnail } from "@/lib/thumbnail/render";
import { SiteFooter } from "../site/SiteFooter";
import { SiteHeader } from "../site/SiteHeader";
import { ImageUpload, PreviewCanvas, readLocalImage } from "./Images";
import { BackgroundControls, RingControls } from "./RingControls";
import { Words } from "./Words";

interface ModeIconProps {
  mode: Mode;
}
function ModeIcon({ mode }: ModeIconProps): React.JSX.Element {
  return (
    <svg className="mode-icon" viewBox="0 0 24 24" aria-hidden="true">
      {mode === "profile" ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="9" r="3" />
          <path d="M6 19v-1a6 6 0 0 1 12 0v1" />
        </>
      ) : mode === "portfolio" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8" cy="10" r="1" />
          <path d="m3 17 6-5 4 3 4-5 4 5" />
        </>
      ) : (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m10 9 5 3-5 3z" />
        </>
      )}
    </svg>
  );
}
function DownloadIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4" />
    </svg>
  );
}
function validMode(value: string): value is Mode {
  return value === "profile" || value === "portfolio" || value === "intro";
}
function modeSteps(mode: Mode): string[] {
  return mode === "profile"
    ? [
        "Pick the ring colour for your badge.",
        "Add your photo: shoulders and up, with a big smile.",
        "Download the PNG and upload it as your Upwork profile photo.",
      ]
    : [
        "Pick what you are making, then a style and a colour.",
        "Add your photo, screenshot and words.",
        mode === "intro"
          ? "Download the PNG and set it as your intro video's thumbnail."
          : "Download the PNG and add it to your Upwork portfolio.",
      ];
}
export function ThumbnailEditor(): React.JSX.Element {
  const [state, setState] = useState<ThumbnailState>(() => initialState());
  const [hashReady, setHashReady] = useState(false);
  const [error, setError] = useState("");
  const [fontsReady, setFontsReady] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const styleListRef = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    // [WHY] The picker scrolls sideways; keep the chosen preset visible when it
    // changes or the mode loads with a preset that sits offscreen.
    styleListRef.current
      ?.querySelector(`[data-style="${state.style}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [state.style]);
  useEffect(() => {
    const sync = () => {
      const mode = location.hash.slice(1);
      if (validMode(mode)) setState((current) => changeMode(current, mode));
    };
    sync();
    setHashReady(true);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (hashReady) history.replaceState(null, "", `#${state.mode}`);
  }, [state.mode, hashReady]);
  const onCrop = useCallback(
    (kind: ImageKind, crop: Crop) => setState((current) => ({ ...current, [kind]: crop })),
    [],
  );
  const onRing = (patch: Partial<Ring>) =>
    setState((current) => ({ ...current, ring: { ...current.ring, ...patch } }));
  useEffect(() => {
    const prevent = (event: DragEvent) => event.preventDefault();
    const paste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((item) =>
        item.type.startsWith("image/"),
      );
      const file = item?.getAsFile();
      if (!file) return;
      event.preventDefault();
      const kind = spec(stateRef.current.style).images.includes("shot") ? "shot" : "face";
      void readLocalImage(file)
        .then((image) => {
          onCrop(kind, {
            image,
            name: file.name || "Pasted image",
            zoom: 100,
            x: 50,
            y: kind === "shot" ? 0 : 30,
          });
          setError("");
        })
        .catch((error) =>
          setError(error instanceof Error ? error.message : "Could not paste image."),
        );
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    window.addEventListener("paste", paste);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
      window.removeEventListener("paste", paste);
    };
  }, [onCrop]);
  const download = async () => {
    const snapshot = stateRef.current;
    setDownloading(true);
    setError("");
    try {
      const ready = await artworkFonts();
      if (!ready)
        throw new Error("The artwork fonts could not load. Please retry before downloading.");
      const canvas = document.createElement("canvas");
      drawThumbnail(canvas, snapshot);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("Could not create PNG. Please retry.")),
          "image/png",
        ),
      );
      const current = snapshot,
        [w, h] = dimensions(current),
        url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.download =
        current.mode === "profile"
          ? `upwork-profile-picture-${w}x${h}.png`
          : `upwork-${current.mode}-thumbnail-${current.style}-${w}x${h}.png`;
      anchor.href = url;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not download image.");
    } finally {
      setDownloading(false);
    }
  };
  const style = spec(state.style),
    [width, height] = dimensions(state),
    profile = state.mode === "profile";
  const downloadButton = (
    <button
      type="button"
      className="primary-button"
      onClick={() => void download()}
      disabled={downloading}
    >
      <DownloadIcon />
      {downloading ? "Preparing PNG…" : "Download PNG"}
    </button>
  );
  return (
    <div className="min-h-screen" data-mode={state.mode} id="top">
      <SiteHeader />
      <div className="studio-container">
        <section className="hero">
          <h1>
            Thumbnails that get <em>clicked</em>
          </h1>
          <p className="lede">
            Make a ringed profile picture, a portfolio thumbnail or an intro video cover. Pick a
            style, add your photo and download a PNG.
          </p>
        </section>
        <fieldset className="mode-selector mode-tabs" aria-label="What are you making?">
          {MODES.map((mode) => (
            <button
              type="button"
              key={mode.id}
              aria-pressed={state.mode === mode.id}
              onClick={() => setState((current) => changeMode(current, mode.id))}
            >
              <ModeIcon mode={mode.id} />
              <span>
                <span className="mode-title">{mode.name}</span>
                <span className="mode-description">{mode.description}</span>
              </span>
            </button>
          ))}
        </fieldset>
        <div className="studio-panel">
          <ol className="steps">
            {modeSteps(state.mode).map((step, index) => (
              <li key={step}>
                <span className="step-number">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <main className="app-grid">
            <div className="controls-column">
              <section className="surface style-panel">
                <div className="picker-heading">
                  <h2>{profile ? "1. Ring colour" : "1. Style"}</h2>
                  {!profile && (
                    <div className="carousel-nav">
                      <button
                        type="button"
                        aria-label="Previous styles"
                        onClick={() =>
                          styleListRef.current?.scrollBy({
                            left: -(styleListRef.current?.clientWidth ?? 300) * 0.8,
                            behavior: "smooth",
                          })
                        }
                      >
                        ←
                      </button>
                      <span>10 styles</span>
                      <button
                        type="button"
                        aria-label="Next styles"
                        onClick={() =>
                          styleListRef.current?.scrollBy({
                            left: (styleListRef.current?.clientWidth ?? 300) * 0.8,
                            behavior: "smooth",
                          })
                        }
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
                {profile ? (
                  <RingControls state={state} onRing={onRing} />
                ) : (
                  <fieldset className="style-options" aria-label="Style" ref={styleListRef}>
                    {STYLES.filter((item) => item.mode === state.mode).map((item) => (
                      <button
                        className="choice style-option"
                        data-style={item.id}
                        type="button"
                        key={item.id}
                        aria-pressed={state.style === item.id}
                        onClick={() => setState((current) => changeStyle(current, item.id))}
                      >
                        <PreviewCanvas
                          state={{
                            ...state,
                            style: item.id,
                            size: state.mode === "portfolio" ? "4x3" : state.size,
                          }}
                          mini
                        />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </fieldset>
                )}
              </section>
              {!profile && (
                <section className="surface theme-panel">
                  <h2>2. Theme</h2>
                  <fieldset className="palette-options" aria-label="Theme colour">
                    {PALETTES.map((item) => (
                      <button
                        className="choice palette-option"
                        key={item.id}
                        type="button"
                        aria-pressed={state.palette === item.id}
                        onClick={() => setState((current) => ({ ...current, palette: item.id }))}
                      >
                        <svg viewBox="0 0 32 32" aria-hidden="true">
                          <defs>
                            <radialGradient id={`palette-${item.id}`} cx="35%" cy="35%" r="75%">
                              <stop stopColor={ARTWORK_PALETTES[item.id].glow} />
                              <stop offset="1" stopColor={ARTWORK_PALETTES[item.id].base} />
                            </radialGradient>
                          </defs>
                          <circle cx="16" cy="16" r="15" fill={`url(#palette-${item.id})`} />
                          <path
                            d="M16 16h15a15 15 0 0 1-15 15z"
                            fill={
                              item.id === "black"
                                ? ARTWORK_PALETTES[item.id].accent
                                : ARTWORK_PALETTES[item.id].line
                            }
                          />
                        </svg>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </fieldset>
                </section>
              )}
              <div className="input-column">
                <section className="surface">
                  <h2>{profile ? "2. Your photo" : "3. Your images"}</h2>
                  {style.images.map((kind) => (
                    <ImageUpload
                      key={kind}
                      kind={kind}
                      crop={state[kind]}
                      onCrop={onCrop}
                      onError={setError}
                      profile={profile}
                      mode={state.mode}
                    />
                  ))}
                </section>
                {profile ? (
                  <BackgroundControls state={state} onRing={onRing} />
                ) : (
                  <Words state={state} setState={setState} />
                )}{" "}
                {!profile && (
                  <section className="surface">
                    <h2>5. Finishing touches</h2>
                    {["stat", "reviews"].includes(state.style) && (
                      <div className="field">
                        <label htmlFor="original-layout">Layout version</label>
                        <select
                          id="original-layout"
                          value={state.originalLayout ? "original" : "reworked"}
                          onChange={(e) => {
                            const originalLayout = e.currentTarget.value === "original";
                            setState((current) => ({ ...current, originalLayout }));
                          }}
                        >
                          <option value="reworked">Reworked composition</option>
                          <option value="original">Original reference composition</option>
                        </select>
                      </div>
                    )}
                    {state.mode === "portfolio" && (
                      <fieldset className="segments" aria-label="Size">
                        {(
                          [
                            { id: "4x3", name: "Portfolio", size: "1000 x 750" },
                            { id: "16x9", name: "Video / YouTube", size: "1280 x 720" },
                          ] as const
                        ).map((size) => (
                          <button
                            key={size.id}
                            type="button"
                            aria-pressed={state.size === size.id}
                            onClick={() => setState((current) => ({ ...current, size: size.id }))}
                          >
                            {size.name}
                            <small>{size.size}</small>
                          </button>
                        ))}
                      </fieldset>
                    )}
                    {!["result", "meet", "proof"].includes(state.style) &&
                      !(state.originalLayout && ["stat", "reviews"].includes(state.style)) && (
                        <div className="field">
                          <label htmlFor="callout-text">Callout text</label>
                          <input
                            id="callout-text"
                            maxLength={22}
                            value={state.calloutText}
                            onChange={(event) => {
                              const calloutText = event.currentTarget.value;
                              setState((current) => ({ ...current, calloutText }));
                            }}
                          />
                          <p className="helper">
                            Overlays an image corner, away from the face and headline. Clear for an
                            icon-only button.
                          </p>
                        </div>
                      )}
                    <p className="helper">
                      Play controls overlay the media. They never add a row or shrink your artwork.
                    </p>
                    <div className="field">
                      <label htmlFor="artwork-backdrop">Background treatment</label>
                      <select
                        id="artwork-backdrop"
                        value={state.backdrop}
                        onChange={(e) => {
                          const backdrop = e.currentTarget.value as ThumbnailState["backdrop"];
                          setState((current) => ({ ...current, backdrop }));
                        }}
                      >
                        <option value="glow">Studio glow</option>
                        <option value="clean">Clean solid</option>
                      </select>
                    </div>
                    {spec(state.style).images.includes("shot") && (
                      <label className="toggle">
                        <span>Browser-window screenshot</span>
                        <input
                          type="checkbox"
                          checked={state.browserFrame}
                          onChange={(e) => {
                            const browserFrame = e.currentTarget.checked;
                            setState((current) => ({ ...current, browserFrame }));
                          }}
                        />
                      </label>
                    )}
                    {spec(state.style).images.includes("shot") && state.browserFrame && (
                      <div className="field">
                        <label htmlFor="browser-url">Browser address bar URL</label>
                        <input
                          id="browser-url"
                          maxLength={48}
                          placeholder="yourproject.com"
                          value={state.browserUrl}
                          onChange={(event) => {
                            const browserUrl = event.currentTarget.value;
                            setState((current) => ({ ...current, browserUrl }));
                          }}
                        />
                        <p className="helper">
                          Shown inside the browser window's address bar. Leave empty for the plain
                          bar.
                        </p>
                      </div>
                    )}
                    {spec(state.style).images.includes("shot") && (
                      <div className="field">
                        <label htmlFor="project-label">Project name in image</label>
                        <input
                          id="project-label"
                          maxLength={28}
                          placeholder="Project name"
                          value={state.projectLabel}
                          onChange={(event) => {
                            const projectLabel = event.currentTarget.value;
                            setState((current) => ({ ...current, projectLabel }));
                          }}
                        />
                        <p className="helper">
                          Adds a text-only name strip inside the project image. Empty hides it.
                        </p>
                      </div>
                    )}
                    {spec(state.style).images.includes("face") &&
                      !["meet", "hello", "banner", "proof", "centered", "signature"].includes(
                        state.style,
                      ) &&
                      !(state.originalLayout && ["stat", "reviews"].includes(state.style)) && (
                        <div className="field">
                          <label htmlFor="portrait-shape">Portrait shape</label>
                          <select
                            id="portrait-shape"
                            value={state.portraitShape}
                            onChange={(e) => {
                              const portraitShape = e.currentTarget
                                .value as ThumbnailState["portraitShape"];
                              setState((current) => ({ ...current, portraitShape }));
                            }}
                          >
                            <option value="rounded">Soft corners</option>
                            <option value="square">Square corners</option>
                            <option value="circle">Circle crop</option>
                          </select>
                        </div>
                      )}
                    {state.style !== "meet" && (
                      <label className="toggle">
                        <span>Show button label</span>
                        <input
                          type="checkbox"
                          checked={state.overlayLabel}
                          onChange={(e) => {
                            const overlayLabel = e.currentTarget.checked;
                            setState((current) => ({ ...current, overlayLabel }));
                          }}
                        />
                      </label>
                    )}
                    {state.play && (
                      <fieldset className="field">
                        <legend>Play button position</legend>
                        <p className="helper">
                          Move from the layout's starting position. Zero restores that position.
                        </p>
                        {(
                          [
                            ["playOffsetX", "Horizontal position"],
                            ["playOffsetY", "Vertical position"],
                          ] as const
                        ).map(([key, label]) => (
                          <label className="range-control" key={key}>
                            <span className="field-label">
                              {label} <output>{state[key]}%</output>
                            </span>
                            <input
                              type="range"
                              min={-100}
                              max={100}
                              step={1}
                              value={state[key]}
                              aria-label={label}
                              onChange={(event) => {
                                const position = Number(event.currentTarget.value);
                                setState((current) => ({ ...current, [key]: position }));
                              }}
                            />
                          </label>
                        ))}
                        <button
                          type="button"
                          className="text-button"
                          onClick={() =>
                            setState((current) => ({ ...current, playOffsetX: 0, playOffsetY: 0 }))
                          }
                        >
                          Reset play position
                        </button>
                      </fieldset>
                    )}
                    <div className="extra-toggles">
                      {(
                        [
                          ["arrow", "Curved arrow"],
                          ["play", "Play button"],
                        ] as const
                      ).map(([key, name]) => (
                        <label className="toggle" key={key}>
                          <span>{name}</span>
                          <input
                            type="checkbox"
                            checked={state[key]}
                            onChange={(event) => {
                              const checked = event.currentTarget.checked;
                              setState((current) => ({ ...current, [key]: checked }));
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </section>
                )}
                <div className="mobile-download">{downloadButton}</div>
              </div>
            </div>
            <section className="preview-column" aria-label="Preview">
              <div className="preview-sticky">
                <div className={`preview-frame ${profile ? "profile-preview" : ""}`}>
                  <div className="canvas-holder">
                    <PreviewCanvas state={state} onFonts={setFontsReady} />
                    {profile && <div className="circle-crop" aria-hidden="true" />}
                  </div>
                </div>
                {downloadButton}
                {profile && (
                  <div className="upwork-mini">
                    <PreviewCanvas state={state} mini />
                    <div className="mini-lines">
                      <span>How it looks on Upwork</span>
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="small-avatar">
                      <PreviewCanvas state={state} mini />
                      <span>Small</span>
                    </div>
                  </div>
                )}
                <div className="preview-meta">
                  <span>
                    {width} x {height} px
                  </span>
                  <span>Your images never leave your browser. Nothing is uploaded.</span>
                </div>
                {state.mode === "intro" && (
                  <p className="preview-note">
                    Set this as the thumbnail of your intro video on YouTube or Vimeo. Upwork adds
                    its own small play button in the middle of it.
                  </p>
                )}
                {profile && (
                  <p className="preview-note">
                    Upwork shows your photo as a circle, so the corners get cut off. The download is
                    a square PNG, ready to upload.
                  </p>
                )}
                {!fontsReady && (
                  <p className="warning" role="status">
                    Artwork fonts are loading. The download will wait for them.
                  </p>
                )}
                {error && (
                  <p className="error-message" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
      <section className="studio-container studio-examples examples">
        <h2>{profile ? "Profile picture tips" : "Style examples"}</h2>
        {profile ? (
          <div className="surface mt-4">
            <ul className="profile-tips">
              {[
                "Shoulders and up. Crop in close so clients can see your face.",
                "A nice big smile. Look at the camera.",
                "A simple background. Or a cut-out PNG with a solid colour behind you.",
                "A ring in your badge colour. Top Rated is blue, Top Rated Plus is pink. It looks good with the Available Now badge.",
              ].map((tip) => (
                <li key={tip}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12 4 4 10-10" />
                  </svg>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <p className="helper mb-4">
              Preview the available styles with your current words and images.
            </p>
            <div className="example-strip">
              {STYLES.filter((item) => item.mode === state.mode).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="choice"
                  onClick={() => setState((current) => changeStyle(current, item.id))}
                >
                  <PreviewCanvas state={{ ...state, style: item.id }} mini />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
