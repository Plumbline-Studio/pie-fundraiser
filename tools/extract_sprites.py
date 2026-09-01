#!/usr/bin/env python3
"""
Extract alpha-keyed character sprites from the Gemini source clips.

The source clips are 1280x720 @ 24fps, white background, locked camera.
White is removed by flood-filling inward from the frame border, so interior
white (her shirt, the whipped cream) survives. The neutral-grey contact
shadow is caught too, by requiring low saturation as well as high brightness.

Every frame in a segment is cropped to the SAME union bounding box, so the
sprite never jitters during playback.

Usage:
    pip install pillow numpy scipy
    python tools/extract_sprites.py /path/to/source-clips

Source clips (not committed - they are large and regenerable):
    gemini_generated_video_FFCBF572.mp4   10s
    gemini_generated_video_C4662896.mp4   20s
    gemini_generated_video_53B1BF9C.mp4   30s
"""
import os
import sys
import glob
import json
import shutil
import subprocess

import numpy as np
from PIL import Image
from scipy import ndimage

# state -> (source clip, first frame, last frame, sheet columns, sheet scale, loop)
SEGMENTS = {
    "taunt":  ("gemini_generated_video_53B1BF9C.mp4", 440, 499, 10, 1.0, True),
    "glance": ("gemini_generated_video_C4662896.mp4", 256, 315, 10, 1.0, False),
    "hit2":   ("gemini_generated_video_FFCBF572.mp4",  36,  71,  6, 1.0, False),
    "hit3":   ("gemini_generated_video_53B1BF9C.mp4", 500, 571, 12, 0.5, False),
}

LABELS = {
    "taunt":  "Idle / taunt - arms crossed, light cream",
    "glance": "Tier 1 - pie glances off right shoulder, face stays clean",
    "hit2":   "Tier 2 - two pies, direct face hit",
    "hit3":   "Tier 3 - three simultaneous pies, full-frame spray",
}

OUT_ROOT = "public/characters/teresa"

# background = bright AND desaturated. Cream is warm enough to survive this.
MIN_BRIGHTNESS = 215
MAX_SATURATION = 14
PAD = 6


def key_frame(rgb):
    """Return an alpha channel with border-connected white knocked out."""
    mx = rgb.max(axis=2).astype(int)
    mn = rgb.min(axis=2).astype(int)
    bright = (mn >= MIN_BRIGHTNESS) & ((mx - mn) <= MAX_SATURATION)

    labels, _ = ndimage.label(bright)
    border = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
    border.discard(0)

    background = np.isin(labels, list(border))
    return np.where(background, 0, 255).astype(np.uint8)


def foot_anchor(alpha):
    """Bottom-centre of the character - the point every state aligns on."""
    ys, xs = np.nonzero(alpha)
    bottom = int(ys.max())
    return int(xs[ys >= bottom - 25].mean()), bottom


def extract(name, clip_dir, tmp="_tmp_frames"):
    clip, start, end, cols, scale, loop = SEGMENTS[name]
    src = os.path.join(clip_dir, clip)
    if not os.path.exists(src):
        raise SystemExit(f"missing source clip: {src}")

    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    subprocess.run([
        "ffmpeg", "-v", "error", "-i", src,
        "-vf", f"select='between(n,{start},{end})'", "-vsync", "0",
        f"{tmp}/f%03d.png",
    ], check=True)

    keyed = []
    x0 = y0 = 10 ** 9
    x1 = y1 = -1
    for path in sorted(glob.glob(f"{tmp}/*.png")):
        rgb = np.array(Image.open(path).convert("RGB"))
        alpha = key_frame(rgb)
        keyed.append(np.dstack([rgb, alpha]))
        ys, xs = np.nonzero(alpha)
        if len(xs):
            x0, x1 = min(x0, xs.min()), max(x1, xs.max())
            y0, y1 = min(y0, ys.min()), max(y1, ys.max())

    h, w = keyed[0].shape[:2]
    x0, y0 = max(0, x0 - PAD), max(0, y0 - PAD)
    x1, y1 = min(w - 1, x1 + PAD), min(h - 1, y1 + PAD)

    frames_dir = f"{OUT_ROOT}/frames/{name}"
    os.makedirs(frames_dir, exist_ok=True)
    os.makedirs(f"{OUT_ROOT}/sheets", exist_ok=True)

    crops = []
    for i, rgba in enumerate(keyed):
        im = Image.fromarray(rgba[y0:y1 + 1, x0:x1 + 1], "RGBA")
        im.save(f"{frames_dir}/{name}_{i:02d}.png")
        crops.append(im)

    cw, ch = crops[0].size
    scw, sch = int(cw * scale), int(ch * scale)
    rows = (len(crops) + cols - 1) // cols
    sheet = Image.new("RGBA", (scw * cols, sch * rows), (0, 0, 0, 0))
    for i, im in enumerate(crops):
        cell = im.resize((scw, sch), Image.LANCZOS) if scale != 1.0 else im
        sheet.paste(cell, ((i % cols) * scw, (i // cols) * sch))
    sheet.save(f"{OUT_ROOT}/sheets/{name}.png")

    shutil.rmtree(tmp, ignore_errors=True)

    ax, ay = foot_anchor(np.array(crops[0])[:, :, 3])
    return {
        "label": LABELS[name],
        "frames": len(crops),
        "fps": 24,
        "loop": loop,
        "cell": {"w": cw, "h": ch},
        "foot_anchor": {"x": ax, "y": ay},
        "sheet": f"/characters/teresa/sheets/{name}.png",
        "sheet_columns": cols,
        "sheet_scale": scale,
        "frames_dir": f"/characters/teresa/frames/{name}/",
    }


def main():
    clip_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    manifest = {
        "character": "teresa",
        "source": "Gemini 1280x720 @ 24fps, white background, locked camera",
        "keying": "border flood-fill; interior white (shirt, cream) preserved",
        "anchor": "align sprites by foot_anchor, NOT by cell centre",
        "states": {},
    }
    for name in SEGMENTS:
        manifest["states"][name] = extract(name, clip_dir)
        print(f"  {name}: {manifest['states'][name]['frames']} frames")

    os.makedirs(OUT_ROOT, exist_ok=True)
    with open(f"{OUT_ROOT}/manifest.json", "w") as fh:
        json.dump(manifest, fh, indent=2)
    print(f"wrote {OUT_ROOT}/manifest.json")


if __name__ == "__main__":
    main()
