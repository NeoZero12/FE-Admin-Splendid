import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/src/lib/auth";

export type AdminRecord = {
	id: string;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown;
};

export type AdminIdentity = {
	email: string;
	name?: string;
	role: "admin";
};

export function getSessionToken(): string | null {
	if (typeof window === "undefined") return null;
	return (
		window.localStorage.getItem(AUTH_TOKEN_KEY) ??
		window.sessionStorage.getItem(AUTH_TOKEN_KEY)
	);
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
	const token = getSessionToken();
	const headers = new Headers(init.headers);
	if (token) headers.set("Authorization", `Bearer ${token}`);
	if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers,
			cache: "no-store",
		});
	} catch {
		throw new Error("Tidak dapat menghubungi API admin. Pastikan backend sedang berjalan.");
	}

	if (response.status === 401 && typeof window !== "undefined") {
		window.localStorage.removeItem(AUTH_TOKEN_KEY);
		window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
		window.dispatchEvent(new Event("admin:unauthorized"));
	}
	if (response.status === 204) return undefined as T;
	const result = (await response.json().catch(() => ({}))) as { error?: string } & T;
	if (!response.ok) throw new Error(result.error || `Permintaan gagal (${response.status}).`);
	return result;
}

export async function listRecords(collection: string): Promise<AdminRecord[]> {
	const response = await adminRequest<{ data: AdminRecord[] }>(
		`/data/${encodeURIComponent(collection)}`,
	);
	return response.data;
}

export async function getRecord(collection: string, id: string): Promise<AdminRecord> {
	const response = await adminRequest<{ data: AdminRecord }>(
		`/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
	);
	return response.data;
}

export async function createRecord(
	collection: string,
	payload: Record<string, unknown>,
): Promise<AdminRecord> {
	const response = await adminRequest<{ data: AdminRecord }>(
		`/data/${encodeURIComponent(collection)}`,
		{ method: "POST", body: JSON.stringify(payload) },
	);
	return response.data;
}

export async function updateRecord(
	collection: string,
	id: string,
	payload: Record<string, unknown>,
): Promise<AdminRecord> {
	const response = await adminRequest<{ data: AdminRecord }>(
		`/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
		{ method: "PATCH", body: JSON.stringify(payload) },
	);
	return response.data;
}

export async function removeRecord(collection: string, id: string): Promise<void> {
	await adminRequest<void>(
		`/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
		{ method: "DELETE" },
	);
}

export async function getCurrentAdmin(): Promise<AdminIdentity> {
	const response = await adminRequest<{ user: AdminIdentity }>("/auth/me");
	return response.user;
}
