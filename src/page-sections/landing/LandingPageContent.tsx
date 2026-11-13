"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLenisResizeOnMount } from "@/hooks/useLenisResizeOnMount";
import { LandingBrandStatement } from "@/page-sections/landing/LandingBrandStatement";

/** Hero is its own chunk so GSAP/Three stay out of the shared landing shell graph. */
const LandingHeroImmersive = dynamic(
	() =>
		import("@/page-sections/landing/LandingHeroImmersive").then((m) => ({
			default: m.LandingHeroImmersive,
		})),
	{ ssr: true },
);

const LandingStats = dynamic(
	() =>
		import("@/page-sections/landing/LandingStats").then((m) => ({
			default: m.LandingStats,
		})),
	{ ssr: false },
);

const LandingTestimonials = dynamic(
	() =>
		import("@/page-sections/landing/LandingTestimonials").then((m) => ({
			default: m.LandingTestimonials,
		})),
	{ ssr: false },
);

const LandingCta = dynamic(
	() =>
		import("@/page-sections/landing/LandingCta").then((m) => ({
			default: m.LandingCta,
		})),
	{ ssr: false },
);

const LandingProjects = dynamic(
	() =>
		import("@/page-sections/landing/LandingProjects").then((m) => ({
			default: m.LandingProjects,
		})),
	{ ssr: false },
);

const LandingMaterials = dynamic(
	() =>
		import("@/page-sections/landing/LandingMaterials").then((m) => ({
			default: m.LandingMaterials,
		})),
	{ ssr: false },
);

const LandingProcess = dynamic(
	() =>
		import("@/page-sections/landing/LandingProcess").then((m) => ({
			default: m.LandingProcess,
		})),
	{ ssr: false },
);

const LandingVisualStory = dynamic(
	() =>
		import("@/page-sections/landing/LandingVisualStory").then((m) => ({
			default: m.LandingVisualStory,
		})),
	{ ssr: false },
);

const BELOW_FOLD_IDLE_TIMEOUT_MS = 8000;

function useDeferBelowFoldMount(): boolean {
	const [shouldMount, setShouldMount] = useState(false);

	useEffect(() => {
		let idleCallbackId: number | null = null;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let hasMounted = false;

		const mount = () => {
			if (hasMounted) {
				return;
			}
			hasMounted = true;
			cleanup();
			setShouldMount(true);
		};

		const cleanup = () => {
			window.removeEventListener("scroll", mount);
			window.removeEventListener("pointerdown", mount);
			window.removeEventListener("touchstart", mount);
			if (idleCallbackId !== null && typeof window.cancelIdleCallback === "function") {
				window.cancelIdleCallback(idleCallbackId);
			}
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
		};

		window.addEventListener("scroll", mount, { passive: true });
		window.addEventListener("pointerdown", mount, { passive: true });
		window.addEventListener("touchstart", mount, { passive: true });

		const armIdle = () => {
			if (typeof window.requestIdleCallback === "function") {
				idleCallbackId = window.requestIdleCallback(mount, {
					timeout: BELOW_FOLD_IDLE_TIMEOUT_MS,
				});
				return;
			}
			timeoutId = setTimeout(mount, BELOW_FOLD_IDLE_TIMEOUT_MS);
		};

		if (document.readyState === "complete") {
			armIdle();
		} else {
			window.addEventListener("load", armIdle, { once: true });
		}

		return () => {
			window.removeEventListener("load", armIdle);
			cleanup();
		};
	}, []);

	return shouldMount;
}

/**
 * Landing shell — 3D immersive hero is always the homepage hero (never video).
 * Heavy below-fold sections wait for idle/input.
 */
export function LandingPageContent({ isMobileSSR }: { isMobileSSR?: boolean }) {
	useLenisResizeOnMount();
	const shouldMountBelowFold = useDeferBelowFoldMount();

	return (
		<>
			<LandingHeroImmersive isMobileSSR={isMobileSSR} />
			<LandingBrandStatement />
			{shouldMountBelowFold ? (
				<>
					<LandingProjects />
					<LandingMaterials />
					<LandingStats />
					<LandingProcess />
					<LandingTestimonials />
					<LandingVisualStory />
					<LandingCta />
				</>
			) : (
				<div className="bg-sapphire-deep min-h-[50vh]" aria-hidden="true" />
			)}
		</>
	);
}
