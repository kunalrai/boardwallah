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

# Materials palette matching the 18th Century Paris painting & revolutionary history
mat_cobble = create_mat("Cobblestone", (0.55, 0.50, 0.42, 1.0), roughness=0.85)
mat_limestone = create_mat("ParisLimestone", (0.82, 0.76, 0.65, 1.0), roughness=0.7)
mat_limestone_dark = create_mat("ParisLimestoneDark", (0.68, 0.62, 0.52, 1.0), roughness=0.75)
mat_slate_roof = create_mat("SlateRoof", (0.28, 0.32, 0.36, 1.0), roughness=0.6)
mat_wood = create_mat("AgedWood", (0.38, 0.26, 0.16, 1.0), roughness=0.8)
mat_awning = create_mat("CanvasAwning", (0.92, 0.88, 0.78, 1.0), roughness=0.9)
mat_awning_stripe = create_mat("AwningStripe", (0.75, 0.25, 0.20, 1.0), roughness=0.9)
mat_notre_dame = create_mat("NotreDameStone", (0.78, 0.74, 0.68, 1.0), roughness=0.85)
mat_gold = create_mat("OrnamentGold", (0.90, 0.72, 0.20, 1.0), roughness=0.3, metallic=0.8)
mat_bronze = create_mat("BronzePatina", (0.40, 0.42, 0.35, 1.0), roughness=0.4, metallic=0.6)
mat_bastille = create_mat("BastilleStone", (0.30, 0.28, 0.26, 1.0), roughness=0.9)

# French Revolutionary Tricolor Palette
mat_tricolor_blue = create_mat("TricolorBlue", (0.05, 0.25, 0.68, 1.0), roughness=0.6)
mat_tricolor_white = create_mat("TricolorWhite", (0.96, 0.96, 0.96, 1.0), roughness=0.5)
mat_tricolor_red = create_mat("TricolorRed", (0.82, 0.14, 0.14, 1.0), roughness=0.6)

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
    bpy.ops.mesh.primitive_cube_add(location=(-6.8, y_pos, 5.0))
    bldg = bpy.context.active_object
    bldg.name = f"ParisBuilding_Left_{i+1}"
    bldg.scale = (2.2, 3.4, 5.0)
    bldg.data.materials.append(mat_limestone if i % 2 == 0 else mat_limestone_dark)

    bpy.ops.mesh.primitive_cube_add(location=(-6.8, y_pos, 11.2))
    roof = bpy.context.active_object
    roof.name = f"MansardRoof_Left_{i+1}"
    roof.scale = (2.0, 3.4, 1.2)
    roof.rotation_euler = (0, 0.25, 0)
    roof.data.materials.append(mat_slate_roof)

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

    bpy.ops.mesh.primitive_cube_add(location=(6.8, y_pos, 11.2))
    roof = bpy.context.active_object
    roof.name = f"MansardRoof_Right_{i+1}"
    roof.scale = (2.0, 3.4, 1.2)
    roof.rotation_euler = (0, -0.25, 0)
    roof.data.materials.append(mat_slate_roof)

    if i == 1:
        bpy.ops.mesh.primitive_cube_add(location=(4.5, y_pos, 3.2))
        sign = bpy.context.active_object
        sign.name = "HangingTavernSign"
        sign.scale = (0.05, 0.6, 0.45)
        sign.data.materials.append(mat_wood)

# 5. Market Stalls on Left (Phase 1: France Before 1789 & Bread Crisis)
market_x = -2.8
for s_idx in range(3):
    s_y = s_idx * 5.0 + 2.0
    bpy.ops.mesh.primitive_cube_add(location=(market_x, s_y, 0.75))
    table = bpy.context.active_object
    table.name = f"MarketTable_{s_idx+1}"
    table.scale = (0.9, 1.8, 0.45)
    table.data.materials.append(mat_wood)

    bpy.ops.mesh.primitive_cube_add(location=(market_x - 0.4, s_y, 2.6))
    awning = bpy.context.active_object
    awning.name = f"MarketAwning_{s_idx+1}"
    awning.scale = (1.6, 2.2, 0.05)
    awning.rotation_euler = (0, -0.28, 0)
    awning.data.materials.append(mat_awning if s_idx % 2 == 0 else mat_awning_stripe)

    for b_idx in range(3):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=0.25, location=(market_x - 0.3 + b_idx * 0.3, s_y - 0.7 + b_idx * 0.7, 1.35))
        basket = bpy.context.active_object
        basket.name = f"BreadBasket_{s_idx+1}_{b_idx+1}"
        basket.data.materials.append(mat_wood)

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(market_x - 0.3 + b_idx * 0.3, s_y - 0.7 + b_idx * 0.7, 1.55))
        loaf = bpy.context.active_object
        loaf.name = f"BreadLoaf_{s_idx+1}_{b_idx+1}"
        loaf.scale = (1.2, 0.9, 0.6)
        loaf.data.materials.append(mat_bread)

# 6. Figures Representing the Social Estates
# --- Third Estate Peasant Vendor ---
bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=1.65, location=(-1.8, 4.0, 0.85))
peasant = bpy.context.active_object
peasant.name = "ThirdEstate_PeasantVendor"
peasant.data.materials.append(mat_peasant_linen)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, location=(-1.8, 4.0, 1.85))
peasant_head = bpy.context.active_object
peasant_head.data.materials.append(mat_awning)

# --- Second Estate Aristocrat in Red Coat ---
bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=1.8, location=(1.4, 5.2, 0.95))
noble_man = bpy.context.active_object
noble_man.name = "SecondEstate_Nobility"
noble_man.data.materials.append(mat_noble_red)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(1.4, 5.2, 2.05))
noble_wig = bpy.context.active_object
noble_wig.name = "PowderedWig_Noble"
noble_wig.data.materials.append(mat_awning)

bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=0.18, location=(1.4, 5.2, 2.25))
tricorn = bpy.context.active_object
tricorn.data.materials.append(mat_clergy_black)

# --- Noble Lady in Silk Gown ---
bpy.ops.mesh.primitive_cone_add(radius1=0.65, depth=1.7, location=(2.4, 4.8, 0.9))
noble_lady = bpy.context.active_object
noble_lady.name = "NobleLady_BlueGown"
noble_lady.data.materials.append(mat_noble_blue)

bpy.ops.mesh.primitive_uv_sphere_add(radius=0.24, location=(2.4, 4.8, 1.95))
lady_head = bpy.context.active_object
lady_head.data.materials.append(mat_awning)

# --- First Estate Clergy in Black Cassock ---
bpy.ops.mesh.primitive_cylinder_add(radius=0.34, depth=1.8, location=(3.2, 6.5, 0.95))
cleric = bpy.context.active_object
cleric.name = "FirstEstate_Clergy"
cleric.data.materials.append(mat_clergy_black)

# ════════════════════════════════════════════════════════════════════════════
# 7. PHASE 2: THREE ESTATES SOCIAL PYRAMID (3-Tiered Monument)
# ════════════════════════════════════════════════════════════════════════════
# Tier 1 (Base - 3rd Estate: 97% population / all taxes)
bpy.ops.mesh.primitive_cube_add(location=(3.6, 1.0, 0.3))
pyr_base = bpy.context.active_object
pyr_base.name = "ThreeEstates_Pyramid"
pyr_base.scale = (1.2, 1.2, 0.3)
pyr_base.data.materials.append(mat_peasant_linen)

# Tier 2 (Middle - 2nd Estate: Nobility 2% pop / 60% land)
bpy.ops.mesh.primitive_cube_add(location=(3.6, 1.0, 0.8))
pyr_mid = bpy.context.active_object
pyr_mid.name = "EstatePyramid_Nobility"
pyr_mid.scale = (0.85, 0.85, 0.25)
pyr_mid.data.materials.append(mat_noble_red)

# Tier 3 (Apex - 1st Estate: Clergy 1% pop / tithes)
bpy.ops.mesh.primitive_cube_add(location=(3.6, 1.0, 1.25))
pyr_top = bpy.context.active_object
pyr_top.name = "EstatePyramid_Clergy"
pyr_top.scale = (0.5, 0.5, 0.2)
pyr_top.data.materials.append(mat_gold)

# Golden Cross / Scales finial
bpy.ops.mesh.primitive_cone_add(radius1=0.18, depth=0.45, location=(3.6, 1.0, 1.65))
pyr_finial = bpy.context.active_object
pyr_finial.data.materials.append(mat_gold)

# ════════════════════════════════════════════════════════════════════════════
# 8. PHASE 3: TENNIS COURT OATH MONUMENT (20 June 1789)
# ════════════════════════════════════════════════════════════════════════════
# Covered assembly table
bpy.ops.mesh.primitive_cube_add(location=(-3.2, 8.5, 0.8))
tc_table = bpy.context.active_object
tc_table.name = "TennisCourt_OathMonument"
tc_table.scale = (1.1, 1.6, 0.4)
tc_table.data.materials.append(mat_wood)

# Assembly Constitution Parchment Scroll
bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=1.2, location=(-3.2, 8.5, 1.3))
tc_scroll = bpy.context.active_object
tc_scroll.rotation_euler = (0, math.pi / 2, 0)
tc_scroll.data.materials.append(mat_awning)

# National Assembly Tri-color Banner overhead
bpy.ops.mesh.primitive_cube_add(location=(-3.2, 8.5, 2.5))
tc_banner = bpy.context.active_object
tc_banner.scale = (0.05, 1.8, 0.45)
tc_banner.data.materials.append(mat_tricolor_blue)

# ════════════════════════════════════════════════════════════════════════════
# 9. PHASE 4: THE BASTILLE FORTRESS (14 July 1789)
# ════════════════════════════════════════════════════════════════════════════
# West Bastion Tower
bpy.ops.mesh.primitive_cylinder_add(radius=1.8, depth=10.0, location=(-8.5, 21.0, 5.0))
bast_west = bpy.context.active_object
bast_west.name = "Bastille_Fortress"
bast_west.data.materials.append(mat_bastille)

# East Bastion Tower
bpy.ops.mesh.primitive_cylinder_add(radius=1.8, depth=10.0, location=(-5.8, 23.5, 5.0))
bast_east = bpy.context.active_object
bast_east.name = "Bastille_EastTower"
bast_east.data.materials.append(mat_bastille)

# Fortress Curtain Wall connecting towers
bpy.ops.mesh.primitive_cube_add(location=(-7.15, 22.25, 4.0))
bast_wall = bpy.context.active_object
bast_wall.name = "Bastille_CurtainWall"
bast_wall.scale = (1.4, 1.8, 4.0)
bast_wall.data.materials.append(mat_bastille)

# Crenellations on Bastion top
for t_idx, pos in enumerate([(-8.5, 21.0), (-5.8, 23.5)]):
    bpy.ops.mesh.primitive_cylinder_add(radius=2.0, depth=0.8, location=(pos[0], pos[1], 10.4))
    cren = bpy.context.active_object
    cren.data.materials.append(mat_limestone_dark)

# ════════════════════════════════════════════════════════════════════════════
# 10. PHASE 5: DECLARATION OF THE RIGHTS OF MAN & CITIZEN (Aug 1789)
# ════════════════════════════════════════════════════════════════════════════
# Iconic twin stone tablets
bpy.ops.mesh.primitive_cube_add(location=(3.2, 14.0, 2.2))
rights_tablet = bpy.context.active_object
rights_tablet.name = "RightsOfMan_ParchmentTablet"
rights_tablet.scale = (1.1, 0.25, 1.4)
rights_tablet.data.materials.append(mat_limestone)

# Tablet Neoclassical Pedestal
bpy.ops.mesh.primitive_cube_add(location=(3.2, 14.0, 0.45))
rights_base = bpy.context.active_object
rights_base.scale = (1.3, 0.45, 0.45)
rights_base.data.materials.append(mat_limestone_dark)

# Eye of Providence triangle above tablet
bpy.ops.mesh.primitive_cone_add(radius1=0.45, depth=0.2, location=(3.2, 14.0, 3.8))
eye_prov = bpy.context.active_object
eye_prov.rotation_euler = (math.pi / 2, 0, 0)
eye_prov.data.materials.append(mat_gold)

# ════════════════════════════════════════════════════════════════════════════
# 11. PHASE 6: REPUBLIC CIVIC ALTAR & TRICOLOR (1792 Monarchy Abolished)
# ════════════════════════════════════════════════════════════════════════════
# Autel de la Patrie (Altar of the Fatherland)
bpy.ops.mesh.primitive_cylinder_add(radius=1.1, depth=1.1, location=(0, 8.0, 0.55))
altar = bpy.context.active_object
altar.name = "Republic_NationalAltar"
altar.data.materials.append(mat_limestone)

# Civic Oak Wreath on Altar
bpy.ops.mesh.primitive_torus_add(major_radius=0.65, minor_radius=0.1, location=(0, 8.0, 1.15))
wreath = bpy.context.active_object
wreath.data.materials.append(mat_bronze)

# Twin Tricolor Flagstaffs (Blue, White, Red)
for side, x_f in [("Left", -0.9), ("Right", 0.9)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=3.2, location=(x_f, 8.0, 1.6))
    staff = bpy.context.active_object
    staff.data.materials.append(mat_gold)

    bpy.ops.mesh.primitive_cube_add(location=(x_f + (0.35 if side == "Right" else -0.35), 8.0, 2.8))
    flag = bpy.context.active_object
    flag.name = f"TricolorFlag_{side}"
    flag.scale = (0.35, 0.02, 0.3)
    flag.data.materials.append(mat_tricolor_red if side == "Right" else mat_tricolor_blue)

# ════════════════════════════════════════════════════════════════════════════
# 12. PHASE 7: REIGN OF TERROR TRIBUNAL PODIUM (1793-1794 Robespierre)
# ════════════════════════════════════════════════════════════════════════════
# Revolutionary Tribunal Rostrum
bpy.ops.mesh.primitive_cube_add(location=(-3.2, 14.5, 1.0))
tribunal = bpy.context.active_object
tribunal.name = "ReignOfTerror_Tribunal"
tribunal.scale = (0.85, 0.85, 0.95)
tribunal.data.materials.append(mat_wood)

# Bronze Scales of Revolutionary Justice
bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.9, location=(-3.2, 14.5, 2.2))
scale_post = bpy.context.active_object
scale_post.data.materials.append(mat_bronze)

bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.8, location=(-3.2, 14.5, 2.55))
scale_beam = bpy.context.active_object
scale_beam.rotation_euler = (0, math.pi / 2, 0)
scale_beam.data.materials.append(mat_bronze)

# ════════════════════════════════════════════════════════════════════════════
# 13. PHASE 8: NAPOLEONIC IMPERIAL STANDARD & CODE 1804
# ════════════════════════════════════════════════════════════════════════════
# Fluted Triumphal Column
bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=5.2, location=(3.2, 19.0, 2.6))
nap_col = bpy.context.active_object
nap_col.name = "Napoleonic_EagleStandard"
nap_col.data.materials.append(mat_limestone)

# Capital & Imperial Golden Eagle
bpy.ops.mesh.primitive_cube_add(location=(3.2, 19.0, 5.35))
nap_cap = bpy.context.active_object
nap_cap.scale = (0.55, 0.55, 0.15)
nap_cap.data.materials.append(mat_gold)

bpy.ops.mesh.primitive_cone_add(radius1=0.42, depth=0.55, location=(3.2, 19.0, 5.75))
nap_eagle = bpy.context.active_object
nap_eagle.name = "Napoleonic_GoldenEagle"
nap_eagle.data.materials.append(mat_gold)

# Civil Code of 1804 Plinth
bpy.ops.mesh.primitive_cube_add(location=(3.2, 19.0, 0.35))
code_base = bpy.context.active_object
code_base.name = "NapoleonicCode_1804"
code_base.scale = (0.7, 0.7, 0.35)
code_base.data.materials.append(mat_bronze)

# ════════════════════════════════════════════════════════════════════════════
# 14. BACKGROUND VISTA: PORTE SAINT-DENIS ARCH & NOTRE-DAME TOWERS
# ════════════════════════════════════════════════════════════════════════════
bpy.ops.mesh.primitive_cube_add(location=(0, 24.0, 3.8))
arch_body = bpy.context.active_object
arch_body.name = "ParisTriumphalArch"
arch_body.scale = (4.4, 1.2, 3.8)
arch_body.data.materials.append(mat_notre_dame)

bpy.ops.mesh.primitive_cube_add(location=(0, 23.9, 2.2))
arch_portal = bpy.context.active_object
arch_portal.name = "ArchPortal"
arch_portal.scale = (1.8, 1.3, 2.2)
arch_portal.data.materials.append(mat_limestone_dark)

for t_idx, x_tower in [("North", -1.4), ("South", 1.4)]:
    bpy.ops.mesh.primitive_cube_add(location=(x_tower, 28.5, 8.5))
    tower = bpy.context.active_object
    tower.name = f"NotreDameTower_{t_idx}"
    tower.scale = (1.1, 1.1, 8.5)
    tower.data.materials.append(mat_notre_dame)

bpy.ops.mesh.primitive_cube_add(location=(0, 28.5, 5.0))
cathedral_nave = bpy.context.active_object
cathedral_nave.name = "NotreDameNave"
cathedral_nave.scale = (2.2, 1.0, 5.0)
cathedral_nave.data.materials.append(mat_notre_dame)

bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=0.2, location=(0, 27.5, 7.2))
rose_win = bpy.context.active_object
rose_win.rotation_euler = (math.pi / 2, 0, 0)
rose_win.name = "NotreDameRoseWindow"
rose_win.data.materials.append(mat_slate_roof)

# ════════════════════════════════════════════════════════════════════════════
# 15. LIGHTING SETUP
# ════════════════════════════════════════════════════════════════════════════
sun_data = bpy.data.lights.new(name="ParisSunlight", type='SUN')
sun_data.energy = 3.5
sun_data.color = (1.0, 0.92, 0.78)
sun_obj = bpy.data.objects.new(name="SunLight", object_data=sun_data)
sun_obj.location = (8.0, -10.0, 16.0)
sun_obj.rotation_euler = (0.75, 0.45, 0.85)
bpy.context.collection.objects.link(sun_obj)

sky_data = bpy.data.lights.new(name="SkyFillLight", type='SUN')
sky_data.energy = 1.2
sky_data.color = (0.75, 0.85, 1.0)
sky_obj = bpy.data.objects.new(name="SkyLight", object_data=sky_data)
sky_obj.location = (-6.0, 10.0, 12.0)
sky_obj.rotation_euler = (-0.6, -0.3, -0.5)
bpy.context.collection.objects.link(sky_obj)

# ════════════════════════════════════════════════════════════════════════════
# 16. EXPORT TO GLB
# ════════════════════════════════════════════════════════════════════════════
output_path = r"C:\Users\demo\Downloads\website\frontend\public\assets\sst\history\french-revolution-paris.glb"
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=True
)

print(f"SUCCESS: Exported Full French Revolution 8-Phase 3D Scene to {output_path}")
