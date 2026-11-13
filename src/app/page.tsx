import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootRedirectPage() {
	permanentRedirect(`/${routing.defaultLocale}`);
}
