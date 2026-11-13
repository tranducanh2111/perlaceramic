"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
	LANDING_HERO_RIM_LIGHT_BOUNDS,
	PORCELAIN_SLAB_LAYOUT,
	PORCELAIN_SLAB_TEXTURES,
	type PorcelainSlabLayout,
} from "@/constants/landing-hero";
import { encodePublicAssetPath } from "@/lib/products/media";
import {
	ChampagneGoldDustParticles,
	HERO_GOLD_DUST_PRESET,
} from "@/components/3d/ChampagneGoldDust";

export interface PorcelainGallerySceneProps {
	scrollProgressRef: React.RefObject<number>;
	mouseRef: React.RefObject<{ x: number; y: number }>;
	isPointerOverRef?: React.RefObject<boolean>;
	isActive?: boolean;
	className?: string;
}

interface SlabProps {
	config: PorcelainSlabLayout;
	index: number;
	textures: THREE.Texture[];
	scrollProgressRef: React.RefObject<number>;
	mouseRef: React.RefObject<{ x: number; y: number }>;
	isPointerOverRef?: React.RefObject<boolean>;
}

function configureTexture(texture: THREE.Texture): void {
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.colorSpace = THREE.SRGBColorSpace;
}

function PorcelainSlab({
	config,
	index,
	textures,
	scrollProgressRef,
	mouseRef,
	isPointerOverRef,
}: SlabProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const basePosition = useMemo(() => new THREE.Vector3(...config.position), [config.position]);
	const spreadDirection = basePosition.x >= 0 ? 1 : -1;

	useFrame((state, delta) => {
		const mesh = meshRef.current;
		if (!mesh) {
			return;
		}

		const progress = scrollProgressRef.current ?? 0;
		const mouse = mouseRef.current ?? { x: 0, y: 0 };
		const isPointerOver = isPointerOverRef?.current ?? false;
		const tiltScale = isPointerOver && progress < 0.08 ? 0.2 : 1;
		const time = state.clock.getElapsedTime();
		const spread = progress * 1.35;

		mesh.position.x =
			basePosition.x + spreadDirection * spread * (Math.abs(basePosition.x) * 0.38 + 0.35);
		mesh.position.y = basePosition.y + Math.sin(time * 0.45 + index * 0.7) * 0.045;
		mesh.position.z = basePosition.z - progress * 0.95;

		mesh.rotation.x = THREE.MathUtils.damp(
			mesh.rotation.x,
			config.rotation[0] + mouse.y * 0.07 * tiltScale,
			4,
			delta,
		);
		mesh.rotation.y = THREE.MathUtils.damp(
			mesh.rotation.y,
			config.rotation[1] + mouse.x * 0.09 * tiltScale,
			4,
			delta,
		);
		mesh.rotation.z = THREE.MathUtils.damp(mesh.rotation.z, config.rotation[2], 4, delta);
	});

	const texture = textures[config.textureIndex % textures.length];

	return (
		<mesh ref={meshRef} position={config.position} rotation={config.rotation}>
			<boxGeometry args={[1.12, 1.72, 0.042]} />
			<meshPhysicalMaterial
				map={texture}
				roughness={0.16}
				metalness={0.06}
				clearcoat={0.9}
				clearcoatRoughness={0.12}
				reflectivity={0.95}
				envMapIntensity={0.85}
			/>
		</mesh>
	);
}

function GoldDust({
	scrollProgressRef,
}: {
	scrollProgressRef: React.RefObject<number>;
}) {
	return (
		<ChampagneGoldDustParticles preset={HERO_GOLD_DUST_PRESET} scrollProgressRef={scrollProgressRef} />
	);
}

function RimLightSweep({
	scrollProgressRef,
	mouseRef,
	isPointerOverRef,
}: {
	scrollProgressRef: React.RefObject<number>;
	mouseRef: React.RefObject<{ x: number; y: number }>;
	isPointerOverRef?: React.RefObject<boolean>;
}) {
	const lightRef = useRef<THREE.PointLight>(null);
	const trackBlendRef = useRef(0);
	const ndc = useMemo(() => new THREE.Vector2(), []);
	const raycaster = useMemo(() => new THREE.Raycaster(), []);
	const tilePlane = useMemo(
		() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -LANDING_HERO_RIM_LIGHT_BOUNDS.surfaceZ),
		[],
	);
	const focusPoint = useMemo(() => new THREE.Vector3(), []);
	const lightTarget = useMemo(() => new THREE.Vector3(), []);
	const viewOffset = useMemo(() => new THREE.Vector3(), []);

	const resolveCursorLightTarget = (camera: THREE.Camera, mouse: { x: number; y: number }) => {
		const { minX, maxX, minY, maxY, surfaceZ, cameraPull } = LANDING_HERO_RIM_LIGHT_BOUNDS;

		ndc.set(mouse.x, mouse.y);
		raycaster.setFromCamera(ndc, camera);

		const hit = raycaster.ray.intersectPlane(tilePlane, focusPoint);
		if (!hit) {
			const pointerX = THREE.MathUtils.clamp((mouse.x + 1) * 0.5, 0, 1);
			const pointerY = THREE.MathUtils.clamp((mouse.y + 1) * 0.5, 0, 1);
			focusPoint.set(
				THREE.MathUtils.lerp(minX, maxX, pointerX),
				THREE.MathUtils.lerp(minY, maxY, pointerY),
				surfaceZ,
			);
		}

		viewOffset.subVectors(camera.position, focusPoint);
		if (viewOffset.lengthSq() < 1e-6) {
			viewOffset.set(0, 0, 1);
		}
		viewOffset.normalize().multiplyScalar(cameraPull);
		return lightTarget.copy(focusPoint).add(viewOffset);
	};

	useFrame(({ camera, clock }, delta) => {
		const light = lightRef.current;
		if (!light) {
			return;
		}

		const time = clock.getElapsedTime();
		const autoX = Math.sin(time * 0.32) * 5.5;
		const autoY = Math.cos(time * 0.22) * 1.8 + 0.6;
		const autoZ = 2.8 + Math.sin(time * 0.18) * 0.6;

		const mouse = mouseRef.current ?? { x: 0, y: 0 };
		const progress = scrollProgressRef.current ?? 0;
		const isPointerOver = isPointerOverRef?.current ?? false;
		const isCursorTracking = isPointerOver && progress < 0.08;

		trackBlendRef.current = THREE.MathUtils.damp(
			trackBlendRef.current,
			isCursorTracking ? 1 : 0,
			isCursorTracking ? 8 : 10,
			delta,
		);

		const trackBlend = trackBlendRef.current;

		if (trackBlend < 0.01) {
			trackBlendRef.current = 0;
			light.position.set(autoX, autoY, autoZ);
			light.intensity = 2.8;
			return;
		}

		resolveCursorLightTarget(camera, mouse);

		const targetX = THREE.MathUtils.lerp(autoX, lightTarget.x, trackBlend);
		const targetY = THREE.MathUtils.lerp(autoY, lightTarget.y, trackBlend);
		const targetZ = THREE.MathUtils.lerp(autoZ, lightTarget.z, trackBlend);

		const followSpeed = trackBlend > 0.92 ? 14 : 10;
		light.position.x = THREE.MathUtils.damp(light.position.x, targetX, followSpeed, delta);
		light.position.y = THREE.MathUtils.damp(light.position.y, targetY, followSpeed, delta);
		light.position.z = THREE.MathUtils.damp(light.position.z, targetZ, followSpeed, delta);
		light.intensity = THREE.MathUtils.lerp(2.8, 3.45, trackBlend);
	});

	return (
		<pointLight ref={lightRef} color="#D4B886" intensity={2.8} distance={18} decay={1.8} />
	);
}

function CameraRig({
	scrollProgressRef,
	mouseRef,
	isPointerOverRef,
}: {
	scrollProgressRef: React.RefObject<number>;
	mouseRef: React.RefObject<{ x: number; y: number }>;
	isPointerOverRef?: React.RefObject<boolean>;
}) {
	useFrame((state, delta) => {
		const { camera } = state;
		const progress = scrollProgressRef.current ?? 0;
		const mouse = mouseRef.current ?? { x: 0, y: 0 };
		const isPointerOver = isPointerOverRef?.current ?? false;
		const lockViewForCursorLight = isPointerOver && progress < 0.08;

		const targetZ = THREE.MathUtils.lerp(6.8, 2.1, progress);
		const targetX = lockViewForCursorLight ? 0 : mouse.x * 0.42;
		const targetY = lockViewForCursorLight ? 0 : mouse.y * 0.24;

		camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
		camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
		camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);
		camera.lookAt(0, 0, -0.2);
	});

	return null;
}

function GalleryScene({
	scrollProgressRef,
	mouseRef,
	isPointerOverRef,
}: {
	scrollProgressRef: React.RefObject<number>;
	mouseRef: React.RefObject<{ x: number; y: number }>;
	isPointerOverRef?: React.RefObject<boolean>;
}) {
	const encodedTextureUrls = useMemo(
		() => PORCELAIN_SLAB_TEXTURES.map((path) => encodePublicAssetPath(path)),
		[],
	);
	const loadedTextures = useTexture(encodedTextureUrls);
	const textures = useMemo(() => {
		const list = Array.isArray(loadedTextures) ? loadedTextures : [loadedTextures];
		list.forEach(configureTexture);
		return list;
	}, [loadedTextures]);

	return (
		<>
			<color attach="background" args={["#071A2B"]} />
			<ambientLight intensity={0.28} color="#E8EEF4" />
			<directionalLight position={[4, 6, 5]} intensity={0.55} color="#F4F4F6" />
			<directionalLight position={[-5, 2, -2]} intensity={0.18} color="#1A3D5C" />
			<RimLightSweep
				scrollProgressRef={scrollProgressRef}
				mouseRef={mouseRef}
				isPointerOverRef={isPointerOverRef}
			/>
			<GoldDust scrollProgressRef={scrollProgressRef} />
			{PORCELAIN_SLAB_LAYOUT.map((config, index) => (
				<PorcelainSlab
					key={`slab-${index}`}
					config={config}
					index={index}
					textures={textures}
					scrollProgressRef={scrollProgressRef}
					mouseRef={mouseRef}
					isPointerOverRef={isPointerOverRef}
				/>
			))}
			<CameraRig
				scrollProgressRef={scrollProgressRef}
				mouseRef={mouseRef}
				isPointerOverRef={isPointerOverRef}
			/>
		</>
	);
}

function SceneFallback() {
	return <div className="bg-sapphire-deep absolute inset-0" aria-hidden="true" />;
}

/** Floating porcelain gallery — desktop WebGL hero background. */
export function PorcelainGalleryScene({
	scrollProgressRef,
	mouseRef,
	isPointerOverRef,
	isActive = true,
	className,
}: PorcelainGallerySceneProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Delay Three.js / WebGL initialisation until after the LCP window to
		// avoid competing with critical rendering during page load.
		// 800 ms gives the browser enough time to paint the above-fold content
		// and reach an idle state before we start the GPU-heavy canvas.
		const id = setTimeout(() => setMounted(true), 800);
		return () => clearTimeout(id);
	}, []);

	if (!mounted) {
		return <SceneFallback />;
	}

	return (
		<div className={className ?? "absolute inset-0 z-0"} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, 6.8], fov: 42, near: 0.1, far: 40 }}
				dpr={[1, 1.5]}
				gl={{ alpha: false, antialias: false, powerPreference: "high-performance" }}
				frameloop={isActive ? "always" : "demand"}
			>
				<Suspense fallback={null}>
					<GalleryScene
						scrollProgressRef={scrollProgressRef}
						mouseRef={mouseRef}
						isPointerOverRef={isPointerOverRef}
					/>
				</Suspense>
			</Canvas>
		</div>
	);
}
