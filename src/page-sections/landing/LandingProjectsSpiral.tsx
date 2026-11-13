"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button, Eyebrow, Text } from "@/components/ui";
import { RevealOnView, SectionContainer, useLenisControls } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { ProjectsMobileGrid, ProjectsSpiralExperience } from "./projects/ProjectsScene";
import { useSpiralGeometry } from "./projects/useSpiralGeometry";

/** Spiral chandelier scroll experience (desktop/tablet, grid fallback on mobile / reduced motion). */
export function LandingProjectsSpiral() {
	const t = useTranslations("landing.projects");
	const isReducedMotion = useReducedMotion() ?? false;
	const geometry = useSpiralGeometry(isReducedMotion);
	const lenisControls = useLenisControls();

	useEffect(() => {
		if (!geometry || !lenisControls) return;

		const handleResize = () => lenisControls.resize();
		const timeoutId = setTimeout(handleResize, 150);

		return () => clearTimeout(timeoutId);
	}, [geometry, lenisControls]);

	return (
		<section className="bg-sapphire-deep" aria-label={t("label")}>
			<SectionContainer className="pt-24 pb-14 lg:pt-32">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<RevealOnView>
							<Eyebrow>{t("label")}</Eyebrow>
						</RevealOnView>
						<RevealOnView delay={0.1}>
							<Text variant="display-lg" as="h2" className="text-linen mt-3">
								{t("heading")}
							</Text>
						</RevealOnView>
					</div>

					<RevealOnView delay={0.18}>
						<Button href={ROUTES.projects} variant="outline" size="md">
							{t("viewAll")}
						</Button>
					</RevealOnView>
				</div>
			</SectionContainer>

			{geometry !== null && <ProjectsSpiralExperience geometry={geometry} />}

			<div className={cn("pb-24", geometry !== null && "md:hidden")}>
				<SectionContainer>
					<ProjectsMobileGrid />
				</SectionContainer>
			</div>
		</section>
	);
}
