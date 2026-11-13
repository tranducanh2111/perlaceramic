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

/** Staggered gallery wall — biased right so left-rail type can breathe. */
export const PORCELAIN_SLAB_LAYOUT: readonly PorcelainSlabLayout[] = [
	{ position: [-2.55, 0.42, -0.55], rotation: [0, 0.22, -0.03], textureIndex: 0 },
	{ position: [-0.85, -0.18, 0.22], rotation: [0.05, 0.1, 0], textureIndex: 1 },
	{ position: [0.95, 0.28, 0.05], rotation: [0, -0.04, 0], textureIndex: 2 },
	{ position: [2.45, -0.12, 0.18], rotation: [-0.04, -0.14, 0.01], textureIndex: 3 },
	{ position: [3.85, 0.55, -0.28], rotation: [0, -0.2, 0.03], textureIndex: 4 },
	{ position: [-1.75, -1.05, -0.7], rotation: [0.09, 0.16, 0], textureIndex: 5 },
	{ position: [1.55, -0.88, -0.42], rotation: [0.07, -0.08, 0], textureIndex: 6 },
	{ position: [3.35, -0.95, -0.55], rotation: [0.06, -0.14, 0.02], textureIndex: 7 },
] as const;

/** World-space bounds for cursor-driven rim light (slab cluster + margin). */
export const LANDING_HERO_RIM_LIGHT_BOUNDS = {
	minX: -3.1,
	maxX: 4.2,
	minY: -1.35,
	maxY: 0.85,
	surfaceZ: -0.2,
	/** Distance from surface focus toward camera along view ray. */
	cameraPull: 1.85,
} as const;

/** Scroll driver height multiplier (section = multiplier × 100vh). */
export const LANDING_HERO_SCROLL_HEIGHT_VH = 180;
