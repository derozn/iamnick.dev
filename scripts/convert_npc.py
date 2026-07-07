# Blender headless: Mixamo FBX (skinned + animated) -> GLB for the carnival NPCs.
#
#   /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/convert_npc.py -- in.fbx out.glb
#
# Why Blender and not the assimp pipeline used for the static props: assimp
# mangles skinned meshes/animation curves; Blender's FBX importer handles
# Mixamo's rig + clip reliably.
#
# Materials are exported as PLACEHOLDER — the app re-textures every NPC with the
# shared Synty base atlas at runtime (zero extra VRAM), so shipping Mixamo's
# embedded textures would only bloat the GLB.
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
src, dst = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=src, ignore_leaf_bones=True, use_anim=True)

# strip anything that isn't the character (Mixamo files are clean, but be safe)
for o in [o for o in bpy.data.objects if o.type in ("CAMERA", "LIGHT")]:
    bpy.data.objects.remove(o, do_unlink=True)

bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format="GLB",
    export_animations=True,
    export_skins=True,
    export_yup=True,
    export_materials="PLACEHOLDER",
    export_apply=False,  # never apply modifiers on a skinned mesh
)
print(f"converted {src} -> {dst}")
