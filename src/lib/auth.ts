// Keep browser requests on the Next.js origin; app/api forwards them to the backend.
export const API_BASE_URL = "/api";
export const AUTH_TOKEN_KEY = "splendid-admin-token";

export async function validateSession(token: string): Promise<boolean> {
	try {
		const response = await fetch(`${API_BASE_URL}/auth/me`, {
			cache: "no-store",
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.ok;
	} catch {
		return false;
	}
}

export async function endSession(token: string | null): Promise<void> {
	if (!token) return;
	try {
		await fetch(`${API_BASE_URL}/auth/logout`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
		});
	} catch {
		// The client still clears its token if the API is offline.
	}
}
