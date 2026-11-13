"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Text } from "@/components/ui";
import { PROCESS_STEP_CARD_CLASS, PROCESS_STEPS, type ProcessStep } from "@/constants/landing";

interface ProcessStepCardProps {
	step: ProcessStep;
	index: number;
}

function ProcessStepCard({ step, index }: ProcessStepCardProps) {
	const t = useTranslations("landing.process");

	return (
		<motion.li
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
			viewport={{ once: true, amount: 0.2 }}
		>
			<article className={`${PROCESS_STEP_CARD_CLASS} p-7`}>
				<Text
					variant="display-lg"
					className="text-champagne/20 font-serif font-light select-none"
					aria-hidden
				>
					{step.number}
				</Text>
				<Text as="h3" variant="h4" className="text-linen mt-1">
					{t(`steps.${step.id}.title`)}
				</Text>
				<div className="bg-champagne my-4 h-px w-12" aria-hidden />
				<Text variant="body" className="text-linen/65 leading-relaxed">
					{t(`steps.${step.id}.description`)}
				</Text>
			</article>
		</motion.li>
	);
}

/** Mobile / reduced-motion: stacked step cards without pinned scroll or SVG path. */
export function ProcessMobileStepper() {
	const t = useTranslations("landing.process");

	return (
		<div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
			<header className="text-center">
				<span className="text-label text-champagne font-sans tracking-widest uppercase">
					{t("label")}
				</span>
				<Text variant="h2" className="text-linen mt-3">
					{t("heading")}
				</Text>
			</header>

			<ol className="mt-10 flex list-none flex-col gap-4">
				{PROCESS_STEPS.map((step, index) => (
					<ProcessStepCard key={step.id} step={step} index={index} />
				))}
			</ol>
		</div>
	);
}
