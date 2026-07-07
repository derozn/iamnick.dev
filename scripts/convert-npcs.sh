#!/usr/bin/env bash
# Convert every Mixamo FBX in ~/Documents/Assets/Mixamo/ to a web GLB and
# refresh the NPC manifest the app renders from.
#
#   ./scripts/convert-npcs.sh
#
# Input file naming (set when downloading from mixamo.com):
#   <CharName>__<AnimName>.fbx     e.g. SM_Chr_Carny_01__Idle.fbx
# Download settings: FBX Binary, With Skin, 30 fps, no keyframe reduction.
#
# Output: public/models/npcs/<name>.glb (resampled + pruned; NEVER quantize —
# it corrupts skinned meshes) and src/components/three/synty/npcManifest.json.
set -euo pipefail

SRC_DIR="${1:-$HOME/Documents/Assets/Mixamo}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/models/npcs"
MANIFEST="$(cd "$(dirname "$0")/.." && pwd)/src/components/three/synty/npcManifest.json"
BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"

mkdir -p "$OUT_DIR"
shopt -s nullglob
fbxs=("$SRC_DIR"/*.fbx)
if [ ${#fbxs[@]} -eq 0 ]; then
  echo "no .fbx files in $SRC_DIR — download them from mixamo.com first"
  exit 1
fi

for f in "${fbxs[@]}"; do
  name="$(basename "$f" .fbx)"
  tmp="$OUT_DIR/$name.tmp.glb"
  out="$OUT_DIR/$name.glb"
  echo "== $name"
  "$BLENDER" -b -P "$(dirname "$0")/convert_npc.py" -- "$f" "$tmp" >/dev/null
  # resample dedupes keyframes; prune drops orphans. NO quantize (breaks skins).
  npx --yes @gltf-transform/cli resample "$tmp" "$tmp" >/dev/null
  npx --yes @gltf-transform/cli prune "$tmp" "$out" >/dev/null
  rm -f "$tmp"
  ls -lh "$out" | awk '{print "   ->", $5, $9}'
done

# manifest = the GLB basenames the app may mount (Npcs.tsx filters its data
# array against this, so missing characters simply don't render)
ls "$OUT_DIR" | grep '\.glb$' | sed 's/\.glb$//' | jq -R . | jq -s . > "$MANIFEST"
echo "manifest: $(cat "$MANIFEST")"
