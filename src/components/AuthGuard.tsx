"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AUTH_TOKEN_KEY, endSession, validateSession } from "@/src/lib/auth";

function getStoredToken(): string | null {
	return (
		window.localStorage.getItem(AUTH_TOKEN_KEY) ??
		window.sessionStorage.getItem(AUTH_TOKEN_KEY)
	);
}

function clearStoredTokens(): void {
	window.localStorage.removeItem(AUTH_TOKEN_KEY);
	window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export default function AuthGuard({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function checkSession() {
			const token = getStoredToken();
			if (pathname === "/Login") {
				if (token && (await validateSession(token))) {
					router.replace("/Dashboard");
				} else if (token) {
					clearStoredTokens();
				}
				if (active) setAuthorizedPath(pathname);
				return;
			}

			if (!token) {
				clearStoredTokens();
				if (active) {
					setAuthorizedPath(null);
					router.replace("/Login");
				}
				return;
			}
			if (!(await validateSession(token))) {
				clearStoredTokens();
				if (active) {
					setAuthorizedPath(null);
					router.replace("/Login");
				}
				return;
			}
			if (active) setAuthorizedPath(pathname);
		}

		void checkSession();
		return () => {
			active = false;
		};
	}, [pathname, router]);

	useEffect(() => {
		function handleLogoutClick(event: MouseEvent) {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const button = target.closest<HTMLElement>("[data-auth-logout]");
			if (!button) return;

			event.preventDefault();
			event.stopImmediatePropagation();
			const token = getStoredToken();
			void endSession(token);
			clearStoredTokens();
			setAuthorizedPath(null);
			router.replace("/Login");
		}

		function handleUnauthorized() {
			clearStoredTokens();
			setAuthorizedPath(null);
			router.replace("/Login");
		}

		document.addEventListener("click", handleLogoutClick, true);
		window.addEventListener("admin:unauthorized", handleUnauthorized);
		return () => {
			document.removeEventListener("click", handleLogoutClick, true);
			window.removeEventListener("admin:unauthorized", handleUnauthorized);
		};
	}, [router]);

	if (pathname === "/Login" || authorizedPath === pathname) return children;
	return null;
}
