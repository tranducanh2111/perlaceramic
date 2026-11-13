"use client";

import { useEffect } from "react";
import { useLenisControls } from "@/components/common";

/** Re-measure Lenis cleanly after initial mount without recursive reflow loops. */
export function useLenisResizeOnMount() {
	const lenisControls = useLenisControls();

	useEffect(() => {
		if (!lenisControls) return;

		const handleResize = () => {
			lenisControls.resize();
		};

		// Single measure after initial paint has settled
		const timeoutId = setTimeout(handleResize, 200);
		window.addEventListener("load", handleResize, { once: true });

		return () => {
			clearTimeout(timeoutId);
			window.removeEventListener("load", handleResize);
		};
	}, [lenisControls]);
}
