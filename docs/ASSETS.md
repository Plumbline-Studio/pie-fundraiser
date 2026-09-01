# Character assets - Teresa

Sprite sets for the pie-hit reactions, extracted from Gemini-generated video.

## Where things live

```
public/characters/teresa/
  manifest.json          state definitions, frame counts, anchors
  sheets/<state>.png     sprite sheet (what the engine loads)
  frames/<state>/*.png   individual frames (for inspection / re-packing)
tools/extract_sprites.py regenerates all of the above from the source clips
```

**The PNG binaries are not in git.** They are ~82MB and fully derived from the
source clips, so the repo carries the recipe instead of the output. Run the
extract script to materialise them, or drop in the prebuilt tree.

## States

| State | Frames | Cell | Foot anchor | Loop | What it is |
|---|---|---|---|---|---|
| `taunt` | 60 | 226 x 656 | 102, 647 | yes | Idle / miss reaction - arms crossed, light cream |
| `glance` | 60 | 816 x 659 | 666, 649 | no | Tier 1 - pie clips her right shoulder, face stays clean |
| `hit2` | 36 | 898 x 704 | 446, 695 | no | Tier 2 - two pies, direct face hit |
| `hit3` | 72 | 1280 x 720 | 605, 695 | no | Tier 3 - three simultaneous pies, spray reaches all four edges |

All 24fps.

## The one rule that matters

**Align by `foot_anchor`, never by cell centre.**

Each state was cropped to its own splatter extent, so the cells are different
sizes and the character sits in a different place in each one. Draw every state
so its `foot_anchor` lands on the same screen coordinate and she stays planted
through every transition, however wide the spray gets.

`hit3` is a special case: the cream reaches the frame edges, so it wants to be
composited as a full-play-area effect layer rather than swapped into a
character-sized slot. Clip it to an avatar box and you will cut the spray off.

## Still missing

Tier 4 - the 4+ pie whiteout, where she is genuinely buried and slumped. That is
the payoff state for someone who dumps real money on one president. Needs one
more Gemini generation: same white background, same locked camera, same
full-body framing, then add the segment to `SEGMENTS` in the extract script.

## How the keying works

The source clips are on a white background. A naive white-removal would punch
holes in her shirt and in the whipped cream, so instead the script flood-fills
inward from the frame border - only white that is *connected to the edge* is
removed. Background is additionally required to be desaturated, which also
catches the neutral-grey contact shadow under her feet (otherwise it shows as a
white puddle on a coloured background).

Every frame in a segment is cropped to the same union bounding box so playback
does not jitter.

## Regenerating

The source clips are not committed either. Keep them somewhere findable, then:

```bash
pip install pillow numpy scipy   # plus ffmpeg on PATH
python tools/extract_sprites.py /path/to/source-clips
```

Frame ranges for each state are recorded in `SEGMENTS` at the top of that script.
