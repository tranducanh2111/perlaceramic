/**
 * Single tile face textures for the porcelain gallery hero.
 * Prefer `.detail.webp` sidecars so WebGL uploads less decode work than full JPGs.
 * Never use `allFacesImage` composites (e.g. `*FACES*`, `*FullFaces*`, `*-6 faces*`).
 */
export const PORCELAIN_SLAB_TEXTURES = [
	"/assets/60X120/Inspire G12962J/G12962J (1).detail.webp",
	"/assets/60X120/Inspire G12967J/G12967J_02.detail.webp",
	"/assets/60X120/Travertine T01 T06/G12T01.detail.webp",
	"/assets/60X120/Travertine T01 T06/G12T06.detail.webp",
	"/assets/60X120/Orient Star G12W05J/G12W05J-2.detail.webp",
	"/assets/60X120/Sunshine G12032J/G12032J_03.detail.webp",
	"/assets/60X120/Peace GP12H03J (Flow)/GP12H03J_1_4.detail.webp",
	"/assets/60X120/INDO SS1261307/SS1261307.detail.webp",
] as const;

export interface PorcelainSlabLayout {
	position: readonly [number, number, number];
	rotation: readonly [number, number, number];
	textureIndex: number;
}

/** Staggered gallery wall composition. */
export const PORCELAIN_SLAB_LAYOUT: readonly PorcelainSlabLayout[] = [
	{ position: [-3.1, 0.35, -0.45], rotation: [0, 0.18, -0.02], textureIndex: 0 },
	{ position: [-1.55, -0.25, 0.15], rotation: [0.04, 0.08, 0], textureIndex: 1 },
	{ position: [0, 0.15, 0], rotation: [0, 0, 0], textureIndex: 2 },
	{ position: [1.55, -0.2, 0.08], rotation: [-0.03, -0.1, 0], textureIndex: 3 },
	{ position: [3.1, 0.45, -0.35], rotation: [0, -0.16, 0.02], textureIndex: 4 },
	{ position: [-2.35, -1.15, -0.75], rotation: [0.08, 0.14, 0], textureIndex: 5 },
	{ position: [0.75, -0.95, -0.55], rotation: [0.06, -0.06, 0], textureIndex: 6 },
	{ position: [2.65, -1.05, -0.65], rotation: [0.05, -0.11, 0], textureIndex: 7 },
] as const;

/** World-space bounds for cursor-driven rim light (slab cluster + margin). */
export const LANDING_HERO_RIM_LIGHT_BOUNDS = {
	minX: -3.55,
	maxX: 3.55,
	minY: -1.35,
	maxY: 0.75,
	surfaceZ: -0.2,
	/** Distance from surface focus toward camera along view ray. */
	cameraPull: 1.85,
} as const;

/** Scroll driver height multiplier (section = multiplier × 100vh). */
export const LANDING_HERO_SCROLL_HEIGHT_VH = 180;
