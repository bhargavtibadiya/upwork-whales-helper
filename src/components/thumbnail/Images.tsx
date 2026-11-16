"use client";

import { useEffect, useRef, useState } from "react";
import type { Crop, ImageKind, ThumbnailState } from "@/lib/thumbnail/model";

interface UploadProps {
  kind: ImageKind;
  crop: Crop;
  onCrop: (kind: ImageKind, crop: Crop) => void;
  profile: boolean;
  onError: (message: string) => void;
}
export async function readLocalImage(file: File): Promise<HTMLImageElement> {
  if (!file.type.startsWith("image/"))
    throw new Error("That file is not an image. Please choose a PNG or JPG.");
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("That image could not be opened. Try a PNG or JPG."));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
interface UploadThumbProps {
  image: HTMLImageElement;
}
function UploadThumb({ image }: UploadThumbProps): React.JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    const scale = Math.max(80 / image.naturalWidth, 80 / image.naturalHeight),
      w = image.naturalWidth * scale,
      h = image.naturalHeight * scale;
    c.clearRect(0, 0, 80, 80);
    c.drawImage(image, (80 - w) / 2, (80 - h) / 2, w, h);
  }, [image]);
  return (
    <canvas
      ref={ref}
      width={80}
      height={80}
      className="h-10 w-10 rounded-[var(--ds-radius-sm)]"
      role="img"
      aria-label="Uploaded image thumbnail"
    />
  );
}
export function ImageUpload({
  kind,
  crop,
  onCrop,
  profile,
  onError,
}: UploadProps): React.JSX.Element {
  const [dragging, setDragging] = useState(false);
  const id = `upload-${kind}`;
  const load = async (file: File | undefined) => {
    if (!file) return;
    try {
      const image = await readLocalImage(file);
      onCrop(kind, { image, name: file.name, zoom: 100, x: 50, y: kind === "shot" ? 0 : 30 });
      onError("");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not open image.");
    }
  };
  return (
    <div className="upload-group">
      <label className="field-label" htmlFor={id}>
        {kind === "face" ? "Your photo" : "Screenshot of your Upwork profile or work"}
      </label>
      <input
        className="sr-only"
        type="file"
        id={id}
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={(event) => {
          void load(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={`upload-zone ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void load(event.dataTransfer.files[0]);
        }}
      >
        <span className="upload-icon" aria-hidden="true">
          {crop.image ? (
            <UploadThumb image={crop.image} />
          ) : kind === "face" ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="16" cy="8" r="1" />
              <path d="m3 16 5-5 8 10m-3-6 3-3 5 5" />
            </svg>
          )}
        </span>
        <span>
          <span className="upload-title">
            {crop.image
              ? "Change image"
              : kind === "face"
                ? "Upload your photo"
                : "Upload screenshot"}
          </span>
          <span className="helper">
            PNG or JPG. Drag it here{" "}
            {kind === "shot" ? "or paste with Ctrl+V / Cmd+V." : "or tap to choose."}
          </span>
        </span>
      </label>
      {crop.image && (
        <>
          <div className="file-line">
            <span>{crop.name}</span>
            <button
              className="text-button"
              type="button"
              onClick={() => onCrop(kind, { ...crop, image: null, name: "" })}
            >
              Remove
            </button>
          </div>
          <div className="crop-controls">
            {(
              [
                ["zoom", "Zoom", 100, 300],
                ["x", "Left / right", 0, 100],
                ["y", "Up / down", 0, 100],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className="slider-label">
                <span>{label}</span>
                <input
                  aria-label={`${kind === "face" ? "Photo" : "Screenshot"} ${label}`}
                  type="range"
                  min={min}
                  max={max}
                  value={crop[key]}
                  onChange={(event) =>
                    onCrop(kind, { ...crop, [key]: Number(event.currentTarget.value) })
                  }
                />
              </label>
            ))}
          </div>
        </>
      )}
      {kind === "face" && (
        <p className="tip">
          <span>Tip: </span>
          {profile
            ? "Shoulders and up, a nice big smile and a simple background. Use the sliders to fill the circle with your face."
            : "Use a photo with a plain background, or a cut-out PNG with the background removed. Face the camera and smile."}
        </p>
      )}
    </div>
  );
}
interface CanvasProps {
  state: ThumbnailState;
  mini?: boolean;
  onFonts?: (ready: boolean) => void;
}
export function PreviewCanvas({ state, mini = false, onFonts }: CanvasProps): React.JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let active = true;
    void import("@/lib/thumbnail/render").then(async ({ artworkFonts, drawThumbnail }) => {
      const ready = await artworkFonts();
      if (!active || !ref.current) return;
      drawThumbnail(ref.current, state);
      onFonts?.(ready);
    });
    return () => {
      active = false;
    };
  }, [state, onFonts]);
  return (
    <canvas
      ref={ref}
      className={mini ? "mini-canvas" : "thumbnail-canvas"}
      role={mini ? undefined : "img"}
      aria-hidden={mini ? true : undefined}
      aria-label={
        mini
          ? "Style preview"
          : `${state.mode === "profile" ? "Profile picture" : "Thumbnail"} preview, ${state.style}`
      }
      data-testid={mini ? undefined : "main-canvas"}
    />
  );
}
