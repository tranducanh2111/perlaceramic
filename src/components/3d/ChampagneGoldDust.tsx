"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/cn";

const CHAMPAGNE = "#D4B886";

export interface ChampagneGoldDustMotion {
	rotateYSpeed: number;
	rotateXAmplitude: number;
	rotateXSpeed: number;
}

export interface ChampagneGoldDustPreset {
	particleCount: number;
	size: number;
	baseOpacity: number;
	opacityRange: readonly [number, number];
	sizeAttenuation?: boolean;
	motion: ChampagneGoldDustMotion;
	generatePositions: (particleCount: number) => Float32Array;
}

function pseudoRandom(seed: number): number {
	const value = Math.sin(seed * 12.9898) * 43758.5453;
	return value - Math.floor(value);
}

function generateHeroPositions(particleCount: number): Float32Array {
	const coords = new Float32Array(particleCount * 3);
	for (let i = 0; i < particleCount; i += 1) {
		const radius = 2.5 + (i % 17) * 0.08;
		const theta = i * 0.31;
		const y = Math.sin(i * 0.42) * 2.2;
		coords[i * 3] = Math.cos(theta) * radius;
		coords[i * 3 + 1] = y;
		coords[i * 3 + 2] = Math.sin(theta) * radius - 1.5;
	}
	return coords;
}

/** Full-viewport volume for the projects spiral sticky stage (camera z≈8.5, fov≈54). */
function generateSpiralPositions(particleCount: number): Float32Array {
	const coords = new Float32Array(particleCount * 3);
	const halfWidth = 8.6;
	const halfHeight = 5.2;

	for (let i = 0; i < particleCount; i += 1) {
		const u1 = pseudoRandom(i + 1.07);
		const u2 = pseudoRandom(i + 2.19);
		const u3 = pseudoRandom(i + 3.41);
		const depth = -4.2 + u3 * 5;
		const depthScale = 1 + Math.max(0, -depth) * 0.065;

		coords[i * 3] = (u1 * 2 - 1) * halfWidth * depthScale;
		coords[i * 3 + 1] = (u2 * 2 - 1) * halfHeight * depthScale;
		coords[i * 3 + 2] = depth;
	}

	return coords;
}

export const HERO_GOLD_DUST_PRESET: ChampagneGoldDustPreset = {
	particleCount: 140,
	size: 0.028,
	baseOpacity: 0.42,
	opacityRange: [0.42, 0.08],
	motion: { rotateYSpeed: -0.04, rotateXAmplitude: 0.08, rotateXSpeed: 0.12 },
	generatePositions: generateHeroPositions,
};

export const SPIRAL_GOLD_DUST_PRESET: ChampagneGoldDustPreset = {
	particleCount: 780,
	size: 2.8,
	sizeAttenuation: false,
	baseOpacity: 0.3,
	opacityRange: [0.3, 0.2],
	motion: { rotateYSpeed: -0.012, rotateXAmplitude: 0.018, rotateXSpeed: 0.06 },
	generatePositions: generateSpiralPositions,
};

interface ChampagneGoldDustProps {
	preset: ChampagneGoldDustPreset;
	scrollProgressRef?: React.RefObject<number>;
	isActive?: boolean;
}

export function ChampagneGoldDustParticles({
	preset,
	scrollProgressRef,
	isActive = true,
}: ChampagneGoldDustProps) {
	const pointsRef = useRef<THREE.Points>(null);
	const positions = useMemo(
		() => preset.generatePositions(preset.particleCount),
		[preset],
	);

	useFrame((state) => {
		const points = pointsRef.current;
		if (!points) {
			return;
		}

		const time = state.clock.getElapsedTime();
		const { rotateYSpeed, rotateXAmplitude, rotateXSpeed } = preset.motion;

		if (isActive) {
			points.rotation.y = time * rotateYSpeed;
			points.rotation.x = Math.sin(time * rotateXSpeed) * rotateXAmplitude;
		}

		const progress = scrollProgressRef?.current ?? 0;
		const [opacityHigh, opacityLow] = preset.opacityRange;
		const material = points.material as THREE.PointsMaterial;
		material.opacity = THREE.MathUtils.lerp(opacityHigh, opacityLow, progress);
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[positions, 3]} />
			</bufferGeometry>
			<pointsMaterial
				size={preset.size}
				sizeAttenuation={preset.sizeAttenuation ?? true}
				color={CHAMPAGNE}
				transparent
				opacity={preset.baseOpacity}
				depthWrite={false}
			/>
		</points>
	);
}

export interface ChampagneGoldDustCanvasProps extends ChampagneGoldDustProps {
	className?: string;
	cameraFov?: number;
	cameraZ?: number;
}

/** Ambient champagne particle field — hero gallery, projects spiral, etc. */
export function ChampagneGoldDustCanvas({
	className,
	preset,
	scrollProgressRef,
	isActive = true,
	cameraFov = 42,
	cameraZ = 6.8,
}: ChampagneGoldDustCanvasProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const handle = requestAnimationFrame(() => {
			setMounted(true);
		});
		return () => cancelAnimationFrame(handle);
	}, []);

	if (!mounted || !isActive) {
		return <div className={cn("absolute inset-0", className)} aria-hidden="true" />;
	}

	return (
		<div className={cn("absolute inset-0", className)} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, cameraZ], fov: cameraFov, near: 0.1, far: 40 }}
				dpr={[1, 1.5]}
				gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
				frameloop={isActive ? "always" : "demand"}
			>
				<Suspense fallback={null}>
					<ChampagneGoldDustParticles
						preset={preset}
						scrollProgressRef={scrollProgressRef}
						isActive={isActive}
					/>
				</Suspense>
			</Canvas>
		</div>
	);
}
