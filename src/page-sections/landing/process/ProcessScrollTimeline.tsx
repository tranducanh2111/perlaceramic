"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAppScroll } from "@/hooks/useAppScroll";
import { Text } from "@/components/ui";
import { PROCESS_STEP_CARD_CLASS, PROCESS_STEPS } from "@/constants/landing";
import { cn } from "@/lib/cn";

const STEP_NODE_POSITIONS = [
	{ top: "5%", left: "20px" },
	{ top: "35%", left: "68px" },
	{ top: "65%", left: "68px" },
	{ top: "95%", left: "20px" },
] as const;

const SCROLL_SECTION_HEIGHT_VH = PROCESS_STEPS.length * 100;

/** Large screens: pinned viewport with SVG path and scroll-driven step detail. */
export function ProcessScrollTimeline() {
	const t = useTranslations("landing.process");
	const sectionRef = useRef<HTMLDivElement>(null);
	const [activeStepIndex, setActiveStepIndex] = useState(0);

	const { scrollYProgress } = useAppScroll({
		target: sectionRef,
		offset: ["start start", "end end"],
	});

	useMotionValueEvent(scrollYProgress, "change", (latest) => {
		const index = Math.min(Math.floor(latest * PROCESS_STEPS.length), PROCESS_STEPS.length - 1);
		setActiveStepIndex(index);
	});

	const activeStep = PROCESS_STEPS[activeStepIndex];

	return (
		<div
			ref={sectionRef}
			className="relative"
			style={{ height: `${SCROLL_SECTION_HEIGHT_VH}vh` }}
		>
			<div className="sticky top-0 flex h-screen items-center overflow-hidden">
				<div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
					<header className="mb-12 text-center">
						<span className="text-label text-champagne font-sans tracking-widest uppercase">
							{t("label")}
						</span>
						<Text variant="h2" className="text-linen mt-3">
							{t("heading")}
						</Text>
					</header>

					<div className="grid items-start gap-12 lg:grid-cols-2">
						<div className="relative flex h-[400px] flex-col justify-between py-6 lg:h-[500px]">
							<div className="absolute inset-0 z-0" aria-hidden>
								<svg
									className="h-full w-full"
									viewBox="0 0 100 400"
									preserveAspectRatio="none"
									fill="none"
								>
									<defs>
										<linearGradient
											id="champagneGlow"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="0%"
												stopColor="#D4B886"
												stopOpacity="0.2"
											/>
											<stop
												offset="50%"
												stopColor="#D4B886"
												stopOpacity="1"
											/>
											<stop
												offset="100%"
												stopColor="#D4B886"
												stopOpacity="0.2"
											/>
										</linearGradient>
									</defs>
									<path
										d="M 20 20 C 20 120, 80 140, 80 200 C 80 260, 20 280, 20 380"
										stroke="#1A3D5C"
										strokeWidth="2"
										strokeLinecap="round"
										strokeDasharray="4 8"
									/>
									<motion.path
										d="M 20 20 C 20 120, 80 140, 80 200 C 80 260, 20 280, 20 380"
										stroke="url(#champagneGlow)"
										strokeWidth="3"
										strokeLinecap="round"
										style={{ pathLength: scrollYProgress }}
									/>
								</svg>
							</div>

							{STEP_NODE_POSITIONS.map((position, index) => {
								const isActive = index === activeStepIndex;
								const isPast = index < activeStepIndex;
								const step = PROCESS_STEPS[index];

								return (
									<div
										key={step.id}
										className="absolute z-10 flex items-center gap-4"
										style={{
											top: position.top,
											left: position.left,
											transform: "translate(-50%, -50%)",
										}}
									>
										<div className="relative flex items-center justify-center">
											{isActive && (
												<motion.div
													initial={{ scale: 0.8, opacity: 0.8 }}
													animate={{ scale: 2, opacity: 0 }}
													transition={{
														duration: 2,
														repeat: Infinity,
														ease: "easeOut",
													}}
													className="bg-champagne absolute h-full w-full rounded-full"
													aria-hidden
												/>
											)}
											<div
												className={cn(
													"text-body-sm bg-sapphire-ocean relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 font-sans font-medium transition-colors duration-500",
													isActive
														? "border-champagne text-champagne shadow-[0_0_15px_rgba(212,184,134,0.3)]"
														: isPast
															? "border-champagne/40 text-champagne/60"
															: "border-sapphire-mist text-linen/30",
												)}
											>
												{step.number}
											</div>
										</div>

										<Text
											as="span"
											variant="h5"
											className={cn(
												"absolute left-14 whitespace-nowrap transition-colors duration-500",
												isActive ? "text-linen" : "text-linen/35",
											)}
										>
											{t(`steps.${step.id}.title`)}
										</Text>
									</div>
								);
							})}
						</div>

						<motion.div
							key={activeStep.id}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							className={`${PROCESS_STEP_CARD_CLASS} p-8 lg:p-10`}
						>
							<Text
								variant="display-lg"
								className="text-champagne/20 font-serif font-light select-none"
								aria-hidden
							>
								{activeStep.number}
							</Text>
							<Text variant="h3" className="text-linen mt-2">
								{t(`steps.${activeStep.id}.title`)}
							</Text>
							<div className="bg-champagne my-5 h-px w-12" aria-hidden />
							<Text variant="body-lg" className="text-linen/65 leading-relaxed">
								{t(`steps.${activeStep.id}.description`)}
							</Text>

							<div className="mt-8 flex gap-2" aria-hidden>
								{PROCESS_STEPS.map((_, index) => (
									<div
										key={index}
										className={cn(
											"h-1 rounded-full transition-all duration-500",
											index === activeStepIndex
												? "bg-champagne w-8"
												: index < activeStepIndex
													? "bg-champagne/40 w-4"
													: "bg-sapphire-mist w-4",
										)}
									/>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
