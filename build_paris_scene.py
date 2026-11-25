import bpy
import math

# 1. Reset scene to empty
bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper: Create PBR Material
def create_mat(name, color_rgba, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color_rgba
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

# Materials palette matching the 18th Century Paris painting
mat_cobble = create_mat("Cobblestone", (0.55, 0.50, 0.42, 1.0), roughness=0.85)
mat_limestone = create_mat("ParisLimestone", (0.82, 0.76, 0.65, 1.0), roughness=0.7)
mat_limestone_dark = create_mat("ParisLimestoneDark", (0.68, 0.62, 0.52, 1.0), roughness=0.75)
mat_slate_roof = create_mat("SlateRoof", (0.28, 0.32, 0.36, 1.0), roughness=0.6)
mat_wood = create_mat("AgedWood", (0.38, 0.26, 0.16, 1.0), roughness=0.8)
mat_awning = create_mat("CanvasAwning", (0.92, 0.88, 0.78, 1.0), roughness=0.9)
mat_awning_stripe = create_mat("AwningStripe", (0.75, 0.25, 0.20, 1.0), roughness=0.9)
mat_notre_dame = create_mat("NotreDameStone", (0.78, 0.74, 0.68, 1.0), roughness=0.85)
mat_gold = create_mat("OrnamentGold", (0.90, 0.72, 0.20, 1.0), roughness=0.3, metallic=0.7)

# Character materials
mat_noble_red = create_mat("NobleRedCoat", (0.72, 0.12, 0.12, 1.0), roughness=0.4)
mat_noble_blue = create_mat("NobleBlueGown", (0.22, 0.48, 0.78, 1.0), roughness=0.35)
mat_clergy_black = create_mat("ClergyBlack", (0.08, 0.08, 0.08, 1.0), roughness=0.5)
mat_peasant_linen = create_mat("PeasantLinen", (0.65, 0.58, 0.48, 1.0), roughness=0.9)
mat_bread = create_mat("BreadCrust", (0.72, 0.45, 0.22, 1.0), roughness=0.8)

# 2. Cobblestone Street Ground
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 12, 0))
street = bpy.context.active_object
street.name = "CobblestoneStreet"
street.scale = (9.0, 32.0, 1.0)
street.data.materials.append(mat_cobble)

# Sidewalk curbs (Left and Right)
for side, x_pos in [("Left", -4.2), ("Right", 4.2)]:
    bpy.ops.mesh.primitive_cube_add(location=(x_pos, 12, 0.1))
    curb = bpy.context.active_object
    curb.name = f"Sidewalk_{side}"
    curb.scale = (1.2, 32.0, 0.1)
    curb.data.materials.append(mat_limestone_dark)

# 3. Left Side Multi-Story Paris Facades (Rue de Paris)
for i in range(4):
    y_pos = i * 7.5 - 2.0
    # Main building body
    bpy.ops.mesh.primitive_cube_add(location=(-6.8, y_pos, 5.0))
    bldg = bpy.context.active_object
    bldg.name = f"ParisBuilding_Left_{i+1}"
    bldg.scale = (2.2, 3.4, 5.0)
    bldg.data.materials.append(mat_limestone if i % 2 == 0 else mat_limestone_dark)

    # Mansard Roof
    bpy.ops.mesh.primitive_cube_add(location=(-6.8, y_pos, 11.2))
    roof = bpy.context.active_object
    roof.name = f"MansardRoof_Left_{i+1}"
    roof.scale = (2.0, 3.4, 1.2)
    roof.rotation_euler = (0, 0.25, 0)
    roof.data.materials.append(mat_slate_roof)

    # Chimneys
    for c_idx in range(2):
        bpy.ops.mesh.primitive_cube_add(location=(-7.2, y_pos - 1.2 + c_idx * 2.4, 13.0))
        chimney = bpy.context.active_object
        chimney.scale = (0.35, 0.35, 0.9)
        chimney.data.materials.append(mat_limestone_dark)

# 4. Right Side Multi-Story Paris Facades
for i in range(4):
    y_pos = i * 7.5 - 2.0
    bpy.ops.mesh.primitive_cube_add(location=(6.8, y_pos, 5.0))
    bldg = bpy.context.active_object
    bldg.name = f"ParisBuilding_Right_{i+1}"
    bldg.scale = (2.2, 3.4, 5.0)
    bldg.data.materials.append(mat_limestone if i % 2 == 1 else mat_limestone_dark)

    # Mansard Roof
    bpy.ops.mesh.primitive_cube_add(location=(6.8, y_pos, 11.2))
    roof = bpy.context.active_object
    roof.name = f"MansardRoof_Right_{i+1}"
    roof.scale = (2.0, 3.4, 1.2)
    roof.rotation_euler = (0, -0.25, 0)
    roof.data.materials.append(mat_slate_roof)

    # Hanging Tavern / Shop Sign
    if i == 1:
        bpy.ops.mesh.primitive_cube_add(location=(4.5, y_pos, 3.2))
        sign = bpy.context.active_object
        sign.name = "HangingTavernSign"
        sign.scale = (0.05, 0.6, 0.45)
        sign.data.materials.append(mat_wood)

# 5. Market Stalls on Left (The Third Estate / Bread Market)
market_x = -2.8
for s_idx in range(3):
    s_y = s_idx * 5.0 + 2.0
    # Wooden Table
    bpy.ops.mesh.primitive_cube_add(location=(market_x, s_y, 0.75))
    table = bpy.context.active_object
    table.name = f"MarketTable_{s_idx+1}"
    table.scale = (0.9, 1.8, 0.45)
    table.data.materials.append(mat_wood)

    # Canvas Awning
    bpy.ops.mesh.primitive_cube_add(location=(market_x - 0.4, s_y, 2.6))
    awning = bpy.context.active_object
    awning.name = f"MarketAwning_{s_idx+1}"
    awning.scale = (1.6, 2.2, 0.05)
    awning.rotation_euler = (0, -0.28, 0)
    awning.data.materials.append(mat_awning if s_idx % 2 == 0 else mat_awning_stripe)

    # Baskets & Loaves of Bread (Subsistence Crisis 1789)
    for b_idx in range(3):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.25, location=(market_x - 0.3 + b_idx * 0.3, s_y - 0.7 + b_idx * 0.7, 1.35))
        basket = bpy.context.active_object
        basket.name = f"BreadBasket_{s_idx+1}_{b_idx+1}"
        basket.data.materials.append(mat_wood)

        # Bread sphere inside basket
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(market_x - 0.3 + b_idx * 0.3, s_y - 0.7 + b_idx * 0.7, 1.55))
        loaf = bpy.context.active_object
        loaf.name = f"BreadLoaf_{s_idx+1}_{b_idx+1}"
        loaf.scale = (1.2, 0.9, 0.6)
        loaf.data.materials.append(mat_bread)

# 6. Figures Representing the Three Estates (CBSE Syllabus Theme)
# --- The Third Estate: Peasant Vendor & Commoner (Left) ---
bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=1.65, location=(-1.8, 4.0, 0.85))
peasant = bpy.context.active_object
peasant.name = "ThirdEstate_PeasantVendor"
peasant.data.materials.append(mat_peasant_linen)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(-1.8, 4.0, 1.85))
peasant_head = bpy.context.active_object
peasant_head.data.materials.append(mat_awning)

# --- The Second Estate: Aristocratic Noble in Red Coat & Powdered Wig (Right) ---
bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=1.8, location=(1.4, 5.2, 0.95))
noble_man = bpy.context.active_object
noble_man.name = "SecondEstate_Nobility"
noble_man.data.materials.append(mat_noble_red)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(1.4, 5.2, 2.05))
noble_wig = bpy.context.active_object
noble_wig.name = "PowderedWig_Noble"
noble_wig.data.materials.append(mat_awning)

# Tricorn hat
bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=0.18, location=(1.4, 5.2, 2.25))
tricorn = bpy.context.active_object
tricorn.data.materials.append(mat_clergy_black)

# --- Noble Lady in Sky-Blue Baroque Gown (Right) ---
bpy.ops.mesh.primitive_cone_add(radius1=0.65, depth=1.7, location=(2.4, 4.8, 0.9))
noble_lady = bpy.context.active_object
noble_lady.name = "NobleLady_BlueGown"
noble_lady.data.materials.append(mat_noble_blue)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(2.4, 4.8, 1.95))
lady_head = bpy.context.active_object
lady_head.data.materials.append(mat_awning)

# --- The First Estate: Clergy in Black Cassock (Right-Back) ---
bpy.ops.mesh.primitive_cylinder_add(radius=0.34, depth=1.8, location=(3.2, 6.5, 0.95))
cleric = bpy.context.active_object
cleric.name = "FirstEstate_Clergy"
cleric.data.materials.append(mat_clergy_black)

# 7. Background: Grand Paris Triumphal Arch (Porte Saint-Denis style)
bpy.ops.mesh.primitive_cube_add(location=(0, 24.0, 3.8))
arch_body = bpy.context.active_object
arch_body.name = "ParisTriumphalArch"
arch_body.scale = (4.4, 1.2, 3.8)
arch_body.data.materials.append(mat_notre_dame)

# Arch opening portal (subtractive visual / dark portal)
bpy.ops.mesh.primitive_cube_add(location=(0, 23.9, 2.2))
arch_portal = bpy.context.active_object
arch_portal.name = "ArchPortal"
arch_portal.scale = (1.8, 1.3, 2.2)
arch_portal.data.materials.append(mat_limestone_dark)

# 8. Background Cathedral: Twin Towers of Notre-Dame
for t_idx, x_tower in [("North", -1.4), ("South", 1.4)]:
    bpy.ops.mesh.primitive_cube_add(location=(x_tower, 28.5, 8.5))
    tower = bpy.context.active_object
    tower.name = f"NotreDameTower_{t_idx}"
    tower.scale = (1.1, 1.1, 8.5)
    tower.data.materials.append(mat_notre_dame)

# Cathedral central body & Rose Window arch
bpy.ops.mesh.primitive_cube_add(location=(0, 28.5, 5.0))
cathedral_nave = bpy.context.active_object
cathedral_nave.name = "NotreDameNave"
cathedral_nave.scale = (2.2, 1.0, 5.0)
cathedral_nave.data.materials.append(mat_notre_dame)

# Rose Window
bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=0.2, location=(0, 27.5, 7.2))
rose_win = bpy.context.active_object
rose_win.rotation_euler = (math.pi / 2, 0, 0)
rose_win.name = "NotreDameRoseWindow"
rose_win.data.materials.append(mat_slate_roof)

# 9. Lighting Setup (Late afternoon golden hour matching the painting)
sun_data = bpy.data.lights.new(name="ParisSunlight", type='SUN')
sun_data.energy = 3.5
sun_data.color = (1.0, 0.92, 0.78)
sun_obj = bpy.data.objects.new(name="SunLight", object_data=sun_data)
sun_obj.location = (8.0, -10.0, 16.0)
sun_obj.rotation_euler = (0.75, 0.45, 0.85)
bpy.context.collection.objects.link(sun_obj)

# Soft ambient sky light
sky_data = bpy.data.lights.new(name="SkyFillLight", type='SUN')
sky_data.energy = 1.2
sky_data.color = (0.75, 0.85, 1.0)
sky_obj = bpy.data.objects.new(name="SkyLight", object_data=sky_data)
sky_obj.location = (-6.0, 10.0, 12.0)
sky_obj.rotation_euler = (-0.6, -0.3, -0.5)
bpy.context.collection.objects.link(sky_obj)

# 10. Export to GLB
output_path = r"C:\Users\demo\Downloads\website\frontend\public\assets\sst\history\french-revolution-paris.glb"
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=True
)

print(f"SUCCESS: Exported French Revolution 3D Scene to {output_path}")
