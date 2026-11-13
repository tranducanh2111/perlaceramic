"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import {
	ChampagneGoldDustCanvas,
	SPIRAL_GOLD_DUST_PRESET,
} from "@/components/3d/ChampagneGoldDust";
import { FEATURED_PROJECTS } from "@/constants/landing";
import { SCROLL_VH_PER_CARD, SPRING_CONFIG, type SpiralGeometry } from "./constants";
import { ProjectsSpiralStage } from "./ProjectsSpiralStage";

export { ProjectsMobileGrid } from "./ProjectsMobileGrid";

interface ProjectsActiveOverlayProps {
	activeIndex: number;
	totalCards: number;
}

function ProjectsActiveOverlay({ activeIndex, totalCards }: ProjectsActiveOverlayProps) {
	const displayCurrent = String(activeIndex + 1).padStart(2, "0");
	const displayTotal = String(totalCards).padStart(2, "0");

	return (
		<div
			className="pointer-events-none absolute top-1/2 right-6 z-10 flex -translate-y-1/2 flex-col items-center gap-2 lg:right-10"
			aria-hidden="true"
		>
			<span className="font-sans text-[11px] tracking-[0.22em] text-[#D4B886] uppercase tabular-nums">
				{displayCurrent}
			</span>
			<div className="h-14 w-px bg-gradient-to-b from-[#D4B886]/70 via-[#D4B886]/30 to-transparent" />
			<span className="font-sans text-[11px] tracking-[0.22em] text-[#F4F4F6]/30 uppercase tabular-nums">
				{displayTotal}
			</span>
		</div>
	);
}

interface ProjectsSpiralExperienceProps {
	geometry: SpiralGeometry;
}

export function ProjectsSpiralExperience({ geometry }: ProjectsSpiralExperienceProps) {
	const spiralZoneRef = useRef<HTMLDivElement>(null);
	const scrollProgressRef = useRef(0);
	const totalCards = FEATURED_PROJECTS.length;
	const scrollDriverHeight = `${totalCards * SCROLL_VH_PER_CARD}vh`;
	const [activeIndex, setActiveIndex] = useState(0);
	/** Start inactive so the below-fold 3D particle canvas does not consume CPU/GPU during initial page load. */
	const [isParticlesActive, setIsParticlesActive] = useState(false);

	const { scrollYProgress } = useScroll({
		target: spiralZoneRef,
		offset: ["start start", "end end"],
	});

	useMotionValueEvent(scrollYProgress, "change", (progress) => {
		scrollProgressRef.current = progress;
	});

	useEffect(() => {
		const zone = spiralZoneRef.current;
		if (!zone) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsParticlesActive(Boolean(entry?.isIntersecting));
			},
			{ threshold: 0, rootMargin: "300px 0px" },
		);

		observer.observe(zone);
		return () => observer.disconnect();
	}, []);

	const totalHeight = (totalCards - 1) * geometry.verticalPitch;
	const translateY = useSpring(
		useTransform(scrollYProgress, [0, 1], [totalHeight / 2, -totalHeight / 2]),
		SPRING_CONFIG,
	);

	return (
		<div ref={spiralZoneRef} className="relative hidden md:block">
			<div
				className="sticky top-0 h-screen overflow-hidden"
				style={{
					perspective: "1400px",
					perspectiveOrigin: "50% 45%",
					transformStyle: "preserve-3d",
				}}
			>
				<ChampagneGoldDustCanvas
					preset={SPIRAL_GOLD_DUST_PRESET}
					scrollProgressRef={scrollProgressRef}
					isActive={isParticlesActive}
					cameraFov={54}
					cameraZ={8.5}
					className="pointer-events-none absolute inset-0 z-0"
				/>
				<ProjectsSpiralStage
					geometry={geometry}
					scrollYProgress={scrollYProgress}
					translateY={translateY}
					totalCards={totalCards}
					onActiveIndexChange={setActiveIndex}
				/>
				<div
					className="pointer-events-none absolute inset-0 z-[8]"
					style={{
						background:
							"linear-gradient(to bottom, #071A2B 0%, transparent 3%, transparent 97%, #071A2B 100%)",
					}}
					aria-hidden="true"
				/>
				<ProjectsActiveOverlay activeIndex={activeIndex} totalCards={totalCards} />
			</div>
			<div style={{ height: scrollDriverHeight }} aria-hidden="true" />
		</div>
	);
}
