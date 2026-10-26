"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
	adminRequest,
	createRecord,
	getCurrentAdmin,
	getRecord,
	listRecords,
	removeRecord,
	type AdminIdentity,
	type AdminRecord,
	updateRecord,
} from "@/src/lib/admin-data";

type Field = {
	key: string;
	label: string;
	type?: "text" | "email" | "number" | "textarea" | "select";
	required?: boolean;
	options?: string[];
};

type CollectionConfig = {
	label: string;
	singular: string;
	fields: Field[];
};

type PageMode = "dashboard" | "list" | "create" | "edit" | "delete" | "settings";

type RouteConfig = {
	title: string;
	mode: PageMode;
	collection?: string;
};

const statusOptions = ["Aktif", "Tidak aktif"];

const collections: Record<string, CollectionConfig> = {
	flowers: {
		label: "Pasar Bunga",
		singular: "Bunga",
		fields: [
			{ key: "name", label: "Nama bunga", required: true },
			{ key: "category", label: "Kategori" },
			{ key: "price", label: "Harga", type: "number" },
			{ key: "stock", label: "Stok", type: "number" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Deskripsi", type: "textarea" },
		],
	},
	birds: {
		label: "Pasar Burung",
		singular: "Burung",
		fields: [
			{ key: "name", label: "Nama burung", required: true },
			{ key: "species", label: "Jenis burung" },
			{ key: "category", label: "Kategori" },
			{ key: "price", label: "Harga", type: "number" },
			{ key: "stock", label: "Stok", type: "number" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Deskripsi", type: "textarea" },
		],
	},
	fish: {
		label: "Pasar Ikan Hias",
		singular: "Ikan hias",
		fields: [
			{ key: "name", label: "Nama ikan", required: true },
			{ key: "species", label: "Jenis ikan" },
			{ key: "category", label: "Kategori" },
			{ key: "price", label: "Harga", type: "number" },
			{ key: "stock", label: "Stok", type: "number" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Deskripsi", type: "textarea" },
		],
	},
	pets: {
		label: "Hewan Peliharaan",
		singular: "Hewan peliharaan",
		fields: [
			{ key: "name", label: "Nama hewan", required: true },
			{ key: "species", label: "Jenis hewan" },
			{ key: "category", label: "Kategori" },
			{ key: "price", label: "Harga", type: "number" },
			{ key: "stock", label: "Jumlah", type: "number" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Deskripsi", type: "textarea" },
		],
	},
	supplies: {
		label: "Perlengkapan",
		singular: "Barang perlengkapan",
		fields: [
			{ key: "name", label: "Nama barang", required: true },
			{ key: "category", label: "Kategori" },
			{ key: "price", label: "Harga", type: "number" },
			{ key: "stock", label: "Stok", type: "number" },
			{ key: "unit", label: "Satuan" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Deskripsi", type: "textarea" },
		],
	},
	inventory: {
		label: "Inventaris",
		singular: "Barang inventaris",
		fields: [
			{ key: "name", label: "Nama barang", required: true },
			{ key: "sku", label: "Kode barang" },
			{ key: "category", label: "Kategori" },
			{ key: "stock", label: "Stok", type: "number" },
			{ key: "unit", label: "Satuan" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Catatan", type: "textarea" },
		],
	},
	users: {
		label: "Pengguna",
		singular: "Pengguna",
		fields: [
			{ key: "name", label: "Nama", required: true },
			{ key: "email", label: "Email", type: "email" },
			{ key: "phone", label: "Nomor telepon" },
			{ key: "role", label: "Peran" },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
			{ key: "description", label: "Catatan", type: "textarea" },
		],
	},
	community_posts: {
		label: "Forum Komunitas",
		singular: "Kiriman forum",
		fields: [
			{ key: "title", label: "Judul kiriman", required: true },
			{ key: "author", label: "Nama penulis" },
			{ key: "category", label: "Kategori" },
			{ key: "content", label: "Isi kiriman", type: "textarea", required: true },
			{ key: "status", label: "Status", type: "select", options: statusOptions },
		],
	},
	market_locations: {
		label: "Peta Lokasi Pasar",
		singular: "Lokasi pasar",
		fields: [
			{ key: "name", label: "Nama lokasi", required: true },
			{ key: "sector", label: "Blok atau area" },
			{ key: "category", label: "Kategori kios" },
			{ key: "latitude", label: "Garis lintang", type: "number" },
			{ key: "longitude", label: "Garis bujur", type: "number" },
			{ key: "description", label: "Keterangan", type: "textarea" },
		],
	},
};

const routes: Record<string, RouteConfig> = {
	"/": { title: "Dashboard", mode: "dashboard" },
	"/Dashboard": { title: "Dashboard", mode: "dashboard" },
	"/PengelolaanBunga": { title: "Kelola Pasar Bunga", mode: "list", collection: "flowers" },
	"/PengelolaanKategoriBurung": { title: "Kelola Pasar Burung", mode: "list", collection: "birds" },
	"/PengelolaanIkanHias": { title: "Kelola Ikan Hias", mode: "list", collection: "fish" },
	"/PengelolaanPerlengkapan": { title: "Kelola Perlengkapan", mode: "list", collection: "supplies" },
	"/PengelolaanInventaris": { title: "Kelola Inventaris", mode: "list", collection: "inventory" },
	"/PasarBunga": { title: "Pasar Bunga", mode: "list", collection: "flowers" },
	"/PasarPerlengkapan": { title: "Pasar Perlengkapan", mode: "list", collection: "supplies" },
	"/HewanPeliharaan": { title: "Hewan Peliharaan", mode: "list", collection: "pets" },
	"/User": { title: "Pengguna", mode: "list", collection: "users" },
	"/ForumKomunitas": { title: "Forum Komunitas", mode: "list", collection: "community_posts" },
	"/PetaLokasiPasar": { title: "Peta Lokasi Pasar", mode: "list", collection: "market_locations" },
	"/Pengaturan": { title: "Pengaturan Akun", mode: "settings" },
	"/TambahBunga": { title: "Tambah Bunga", mode: "create", collection: "flowers" },
	"/TambahBurung": { title: "Tambah Burung", mode: "create", collection: "birds" },
	"/TambahIkanHias": { title: "Tambah Ikan Hias", mode: "create", collection: "fish" },
	"/TambahHewanPeliharaan": { title: "Tambah Hewan Peliharaan", mode: "create", collection: "pets" },
	"/TambahBarangPerlengkapan": { title: "Tambah Perlengkapan", mode: "create", collection: "supplies" },
	"/UbahBunga": { title: "Ubah Bunga", mode: "edit", collection: "flowers" },
	"/UbahBurung": { title: "Ubah Burung", mode: "edit", collection: "birds" },
	"/UbahIkanHias": { title: "Ubah Ikan Hias", mode: "edit", collection: "fish" },
	"/UbahHewanPeliharaan": { title: "Ubah Hewan Peliharaan", mode: "edit", collection: "pets" },
	"/UbahBarangPerlengkapan": { title: "Ubah Perlengkapan", mode: "edit", collection: "supplies" },
	"/TambahData": { title: "Tambah Data", mode: "create" },
	"/UbahData": { title: "Ubah Data", mode: "edit" },
	"/KonfirmasiHapusBunga": { title: "Hapus Bunga", mode: "delete", collection: "flowers" },
	"/KonfirmasiHapusBurung": { title: "Hapus Burung", mode: "delete", collection: "birds" },
	"/KonfirmasiHapusIkanHias": { title: "Hapus Ikan Hias", mode: "delete", collection: "fish" },
	"/KonfirmasiHapusHewanPeliharaan": { title: "Hapus Hewan Peliharaan", mode: "delete", collection: "pets" },
	"/KonfirmasiHapusBarang": { title: "Hapus Perlengkapan", mode: "delete", collection: "supplies" },
};

const listPaths: Record<string, string> = {
	flowers: "/PengelolaanBunga",
	birds: "/PengelolaanKategoriBurung",
	fish: "/PengelolaanIkanHias",
	pets: "/HewanPeliharaan",
	supplies: "/PengelolaanPerlengkapan",
	inventory: "/PengelolaanInventaris",
	users: "/User",
	community_posts: "/ForumKomunitas",
	market_locations: "/PetaLokasiPasar",
};

const createPaths: Record<string, string> = {
	flowers: "/TambahBunga",
	birds: "/TambahBurung",
	fish: "/TambahIkanHias",
	pets: "/TambahHewanPeliharaan",
	supplies: "/TambahBarangPerlengkapan",
};

const editPaths: Record<string, string> = {
	flowers: "/UbahBunga",
	birds: "/UbahBurung",
	fish: "/UbahIkanHias",
	pets: "/UbahHewanPeliharaan",
	supplies: "/UbahBarangPerlengkapan",
};

const deletePaths: Record<string, string> = {
	flowers: "/KonfirmasiHapusBunga",
	birds: "/KonfirmasiHapusBurung",
	fish: "/KonfirmasiHapusIkanHias",
	pets: "/KonfirmasiHapusHewanPeliharaan",
	supplies: "/KonfirmasiHapusBarang",
};

const navigation = [
	{ label: "Dashboard", href: "/Dashboard", icon: "⌂" },
	{ label: "Bunga", href: "/PengelolaanBunga", icon: "✿" },
	{ label: "Burung", href: "/PengelolaanKategoriBurung", icon: "♧" },
	{ label: "Ikan hias", href: "/PengelolaanIkanHias", icon: "≈" },
	{ label: "Hewan peliharaan", href: "/HewanPeliharaan", icon: "♡" },
	{ label: "Perlengkapan", href: "/PengelolaanPerlengkapan", icon: "▤" },
	{ label: "Inventaris", href: "/PengelolaanInventaris", icon: "▦" },
	{ label: "Pengguna", href: "/User", icon: "♙" },
	{ label: "Forum komunitas", href: "/ForumKomunitas", icon: "☷" },
	{ label: "Peta lokasi", href: "/PetaLokasiPasar", icon: "⌖" },
	{ label: "Pengaturan", href: "/Pengaturan", icon: "⚙" },
];

function formatCurrency(value: unknown): string {
	const amount = typeof value === "number" ? value : Number(value);
	return Number.isFinite(amount)
		? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
		: "—";
}

function formatDate(value: unknown): string {
	if (typeof value !== "string") return "—";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

function primaryText(record: AdminRecord): string {
	const value = record.name ?? record.title ?? record.email ?? record.id;
	return typeof value === "string" ? value : String(value ?? "Tanpa nama");
}

function displayValue(value: unknown): string {
	if (value === null || value === undefined || value === "") return "—";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function toEditorPath(collection: string, id: string): string {
	const path = editPaths[collection] ?? "/UbahData";
	const params = new URLSearchParams({ id });
	if (!editPaths[collection]) params.set("collection", collection);
	return `${path}?${params.toString()}`;
}

function csvValue(value: unknown): string {
	const text = typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "");
	return `"${text.replaceAll('"', '""')}"`;
}

function Button({
	children,
	onClick,
	variant = "secondary",
	type = "button",
	disabled = false,
}: {
	children: React.ReactNode;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "danger" | "quiet";
	type?: "button" | "submit";
	disabled?: boolean;
}) {
	const style = {
		primary: "bg-emerald-600 text-white hover:bg-emerald-700",
		secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
		danger: "bg-rose-600 text-white hover:bg-rose-700",
		quiet: "text-slate-600 hover:bg-slate-100",
	}[variant];
	return (
		<button
			type={type}
			disabled={disabled}
			onClick={onClick}
			className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
		>
			{children}
		</button>
	);
}

function FieldInput({
	field,
	value,
	onChange,
}: {
	field: Field;
	value: string;
	onChange: (value: string) => void;
}) {
	const className = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
	return (
		<label className="block space-y-1.5 text-sm font-medium text-slate-700" htmlFor={`field-${field.key}`}>
			<span>{field.label}{field.required ? " *" : ""}</span>
			{field.type === "textarea" ? (
				<textarea
					id={`field-${field.key}`}
					className={`${className} min-h-28 resize-y`}
					value={value}
					required={field.required}
					onChange={(event) => onChange(event.target.value)}
				/>
			) : field.type === "select" ? (
				<select
					id={`field-${field.key}`}
					className={className}
					value={value}
					required={field.required}
					onChange={(event) => onChange(event.target.value)}
				>
					<option value="">Pilih {field.label.toLowerCase()}</option>
					{(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
				</select>
			) : (
				<input
					id={`field-${field.key}`}
					type={field.type ?? "text"}
					className={className}
					value={value}
					required={field.required}
					min={field.type === "number" ? 0 : undefined}
					step={field.type === "number" ? "any" : undefined}
					onChange={(event) => onChange(event.target.value)}
				/>
			)}
		</label>
	);
}

export default function AdminWorkspace() {
	const pathname = usePathname();
	const router = useRouter();
	const route = routes[pathname] ?? { title: "Data", mode: "list" as const };
	const [queryCollection, setQueryCollection] = useState("");
	const collectionName = route.collection ?? queryCollection;
	const collection = collections[collectionName];
	const [records, setRecords] = useState<AdminRecord[]>([]);
	const [loadedKey, setLoadedKey] = useState("");
	const [pageError, setPageError] = useState("");
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [pageSize, setPageSize] = useState(10);
	const [page, setPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [recordId, setRecordId] = useState("");
	const [record, setRecord] = useState<AdminRecord | null>(null);
	const [formValues, setFormValues] = useState<Record<string, string>>({});
	const [extraJson, setExtraJson] = useState("{}");
	const [formError, setFormError] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const [toast, setToast] = useState("");
	const [detailRecord, setDetailRecord] = useState<AdminRecord | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [dashboardCounts, setDashboardCounts] = useState<Record<string, number>>({});
	const [dashboardError, setDashboardError] = useState("");
	const [currentAdmin, setCurrentAdmin] = useState<AdminIdentity | null>(null);
	const [profileName, setProfileName] = useState("");
	const [profileRecord, setProfileRecord] = useState<AdminRecord | null>(null);
	const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
	const [passwordChange, setPasswordChange] = useState({ currentPassword: "", newPassword: "" });
	const [settingsBusy, setSettingsBusy] = useState(false);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [darkMode, setDarkMode] = useState(false);
	const pageLoadKey = `${pathname}:${reloadKey}:${recordId}:${collectionName}`;
	const isLoading = loadedKey !== pageLoadKey && ["list", "edit", "delete", "dashboard", "settings"].includes(route.mode);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const message = window.sessionStorage.getItem("splendid-admin-flash");
		if (message) window.sessionStorage.removeItem("splendid-admin-flash");
		void Promise.resolve().then(() => {
			if (message && window.localStorage.getItem("splendid-admin-notifications") !== "false") {
				setToast(message);
				window.setTimeout(() => setToast(""), 3500);
			}
			setRecordId(params.get("id") ?? "");
			setQueryCollection(params.get("collection") ?? "");
			setQuery("");
			setStatusFilter("all");
			setPage(1);
			setSelectedIds([]);
			setRecord(null);
			setPageError("");
			setFormError("");
		});
	}, [pathname]);

	useEffect(() => {
		if (!collectionName || route.mode !== "list") return;
		let active = true;
		void listRecords(collectionName)
			.then((data) => { if (active) { setRecords(data); setPageError(""); } })
			.catch((error: unknown) => { if (active) setPageError(error instanceof Error ? error.message : "Data gagal dimuat."); })
			.finally(() => { if (active) setLoadedKey(pageLoadKey); });
		return () => { active = false; };
	}, [collectionName, pageLoadKey, route.mode]);

	useEffect(() => {
		if (route.mode !== "edit" && route.mode !== "delete") return;
		if (!collectionName || !recordId) {
			void Promise.resolve().then(() => {
				setRecord(null);
				setLoadedKey(pageLoadKey);
			});
			return;
		}
		let active = true;
		void getRecord(collectionName, recordId)
			.then((value) => {
				if (!active) return;
				setRecord(value);
				setPageError("");
				if (route.mode === "edit" && collection) {
					const known = new Set(collection.fields.map((field) => field.key));
					setFormValues(Object.fromEntries(collection.fields.map((field) => [field.key, displayValue(value[field.key]).replace(/^—$/, "")])));
					const extra = Object.fromEntries(Object.entries(value).filter(([key]) => !known.has(key) && !["id", "createdAt", "updatedAt"].includes(key)));
					setExtraJson(JSON.stringify(extra, null, 2));
				}
			})
			.catch((error: unknown) => { if (active) setPageError(error instanceof Error ? error.message : "Data tidak ditemukan."); })
			.finally(() => { if (active) setLoadedKey(pageLoadKey); });
		return () => { active = false; };
	}, [collection, collectionName, pageLoadKey, recordId, route.mode]);

	useEffect(() => {
		if (route.mode !== "dashboard") return;
		let active = true;
		void Promise.all(Object.keys(collections).map(async (key) => [key, await listRecords(key)] as const))
			.then((results) => {
				if (active) { setDashboardCounts(Object.fromEntries(results.map(([key, data]) => [key, data.length]))); setDashboardError(""); }
			})
			.catch((error: unknown) => {
				if (active) setDashboardError(error instanceof Error ? error.message : "Ringkasan gagal dimuat.");
			})
			.finally(() => { if (active) setLoadedKey(pageLoadKey); });
		return () => { active = false; };
	}, [pageLoadKey, route.mode]);

	useEffect(() => {
		if (route.mode !== "settings") return;
		let active = true;
		void Promise.all([getCurrentAdmin(), listRecords("admin_profiles")])
			.then(([admin, profiles]) => {
				if (!active) return;
				const profile = profiles.find((item) => item.email === admin.email) ?? null;
				setCurrentAdmin(admin);
				setProfileRecord(profile);
				setProfileName(typeof profile?.name === "string" ? profile.name : admin.name ?? admin.email.split("@")[0] ?? "Admin");
			})
			.catch((error: unknown) => {
				if (active) setPageError(error instanceof Error ? error.message : "Pengaturan gagal dimuat.");
			})
			.finally(() => { if (active) { setSettingsBusy(false); setLoadedKey(pageLoadKey); } });
		return () => { active = false; };
	}, [pageLoadKey, route.mode]);

	useEffect(() => {
		if (route.mode !== "create" && route.mode !== "edit") return;
		void Promise.resolve().then(() => {
			setFormValues(route.mode === "create" ? { status: "Aktif" } : {});
			setExtraJson("{}");
		});
	}, [collectionName, pathname, route.mode]);

	useEffect(() => {
		const notificationValue = window.localStorage.getItem("splendid-admin-notifications");
		const darkValue = window.localStorage.getItem("splendid-admin-dark-mode");
		void Promise.resolve().then(() => {
			if (notificationValue !== null) setNotificationsEnabled(notificationValue === "true");
			if (darkValue !== null) {
				const enabled = darkValue === "true";
				setDarkMode(enabled);
				document.documentElement.classList.toggle("dark", enabled);
			}
		});
	}, []);

	const title = useMemo(() => {
		if ((pathname === "/TambahData" || pathname === "/UbahData") && collection) {
			return `${route.mode === "create" ? "Tambah" : "Ubah"} ${collection.singular}`;
		}
		return route.title;
	}, [collection, pathname, route.mode, route.title]);

	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
		return records.filter((item) => {
			const matchesQuery = !normalizedQuery || JSON.stringify(item).toLocaleLowerCase("id-ID").includes(normalizedQuery);
			const status = typeof item.status === "string" ? item.status.toLocaleLowerCase("id-ID") : "";
			const matchesStatus = statusFilter === "all" || status === statusFilter;
			return matchesQuery && matchesStatus;
		});
	}, [query, records, statusFilter]);

	const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
	const pageRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
	const allVisibleSelected = pageRecords.length > 0 && pageRecords.every((item) => selectedIds.includes(item.id));

	function showNotice(message: string, preserveForNavigation = false) {
		if (preserveForNavigation) window.sessionStorage.setItem("splendid-admin-flash", message);
		if (window.localStorage.getItem("splendid-admin-notifications") === "false") return;
		setToast(message);
		window.setTimeout(() => setToast(""), 3500);
	}

	function openCreate() {
		const destination = createPaths[collectionName] ?? "/TambahData";
		const params = new URLSearchParams();
		if (!createPaths[collectionName]) params.set("collection", collectionName);
		router.push(params.size ? `${destination}?${params.toString()}` : destination);
	}

	function editUrl(id: string) {
		return toEditorPath(collectionName, id);
	}

	function requestDelete(item: AdminRecord) {
		const confirmationPath = deletePaths[collectionName];
		if (confirmationPath) {
			router.push(`${confirmationPath}?id=${encodeURIComponent(item.id)}`);
			return;
		}
		setDeleteTarget(item);
	}

	async function performDelete(item: AdminRecord) {
		if (!collectionName) return;
		setIsDeleting(true);
		try {
			await removeRecord(collectionName, item.id);
			if (route.mode === "delete") {
				router.replace(listPaths[collectionName] ?? "/Dashboard");
			} else {
				setRecords((current) => current.filter((entry) => entry.id !== item.id));
				setSelectedIds((current) => current.filter((id) => id !== item.id));
				setDeleteTarget(null);
				showNotice(`${primaryText(item)} berhasil dihapus.`);
			}
		} catch (error) {
			setPageError(error instanceof Error ? error.message : "Data gagal dihapus.");
		} finally {
			setIsDeleting(false);
		}
	}

	async function deleteSelected() {
		if (!collectionName || selectedIds.length === 0) return;
		setIsDeleting(true);
		try {
			await Promise.all(selectedIds.map((id) => removeRecord(collectionName, id)));
			setRecords((current) => current.filter((item) => !selectedIds.includes(item.id)));
			setSelectedIds([]);
			setDeleteTarget(null);
			showNotice(`${selectedIds.length} data berhasil dihapus.`);
		} catch (error) {
			setPageError(error instanceof Error ? error.message : "Sebagian data gagal dihapus.");
			setReloadKey((current) => current + 1);
		} finally {
			setIsDeleting(false);
		}
	}

	function exportCsv() {
		const keys = Array.from(new Set(filteredRecords.flatMap((item) => Object.keys(item))));
		const csv = [keys.map(csvValue).join(","), ...filteredRecords.map((item) => keys.map((key) => csvValue(item[key])).join(","))].join("\r\n");
		const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${collectionName || "data"}-${new Date().toISOString().slice(0, 10)}.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	}

	function toggleSelect(id: string) {
		setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
	}

	function toggleSelectVisible() {
		setSelectedIds((current) => allVisibleSelected
			? current.filter((id) => !pageRecords.some((item) => item.id === id))
			: Array.from(new Set([...current, ...pageRecords.map((item) => item.id)])));
	}

	async function handleRecordSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!collectionName || !collection) return;
		setFormError("");
		let extra: Record<string, unknown>;
		try {
			const parsed: unknown = JSON.parse(extraJson || "{}");
			if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("Data tambahan harus berupa objek JSON.");
			extra = parsed as Record<string, unknown>;
		} catch {
			setFormError("Data tambahan harus berupa JSON yang valid berbentuk objek.");
			return;
		}

		const payload: Record<string, unknown> = { ...extra };
		for (const field of collection.fields) {
			const value = formValues[field.key]?.trim() ?? "";
			if (!value) continue;
			payload[field.key] = field.type === "number" ? Number(value) : value;
		}
		setIsSaving(true);
		try {
			if (route.mode === "edit" && recordId) {
				await updateRecord(collectionName, recordId, payload);
				showNotice(`${collection.singular} berhasil diperbarui.`, true);
			} else {
				await createRecord(collectionName, payload);
				showNotice(`${collection.singular} berhasil ditambahkan.`, true);
			}
			router.push(listPaths[collectionName] ?? "/Dashboard");
		} catch (error) {
			setFormError(error instanceof Error ? error.message : "Data gagal disimpan.");
		} finally {
			setIsSaving(false);
		}
	}

	async function saveProfile(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!currentAdmin || !profileName.trim()) return;
		setSettingsBusy(true);
		try {
			const payload = { email: currentAdmin.email, name: profileName.trim() };
			const saved = profileRecord
				? await updateRecord("admin_profiles", profileRecord.id, payload)
				: await createRecord("admin_profiles", payload);
			setProfileRecord(saved);
			showNotice("Profil admin berhasil disimpan.");
		} catch (error) {
			setPageError(error instanceof Error ? error.message : "Profil gagal disimpan.");
		} finally {
			setSettingsBusy(false);
		}
	}

	async function registerAdmin(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSettingsBusy(true);
		try {
			await adminRequest("/auth/register", { method: "POST", body: JSON.stringify(newAdmin) });
			setNewAdmin({ name: "", email: "", password: "" });
			showNotice("Akun admin baru berhasil dibuat.");
		} catch (error) {
			setPageError(error instanceof Error ? error.message : "Akun admin gagal dibuat.");
		} finally {
			setSettingsBusy(false);
		}
	}

	async function changePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSettingsBusy(true);
		try {
			await adminRequest<void>("/auth/change-password", {
				method: "POST",
				body: JSON.stringify(passwordChange),
			});
			setPasswordChange({ currentPassword: "", newPassword: "" });
			showNotice("Kata sandi berhasil diperbarui.");
		} catch (error) {
			setPageError(error instanceof Error ? error.message : "Kata sandi gagal diperbarui.");
		} finally {
			setSettingsBusy(false);
		}
	}

	function toggleNotifications() {
		const next = !notificationsEnabled;
		setNotificationsEnabled(next);
		window.localStorage.setItem("splendid-admin-notifications", String(next));
		setToast(next ? "Pemberitahuan tindakan diaktifkan." : "Pemberitahuan tindakan dinonaktifkan.");
	}

	function toggleDarkMode() {
		const next = !darkMode;
		setDarkMode(next);
		window.localStorage.setItem("splendid-admin-dark-mode", String(next));
		document.documentElement.classList.toggle("dark", next);
		setToast(next ? "Mode gelap diaktifkan." : "Mode terang diaktifkan.");
	}

	const workspaceTheme = darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
	const panelTheme = darkMode ? "dark:bg-slate-900 dark:border-slate-800" : "bg-white border-slate-200";
	const textMuted = darkMode ? "dark:text-slate-400" : "text-slate-500";
	const currentTitle = title || collection?.label || "Panel Admin";

	return (
		<div className={`admin-workspace min-h-screen ${workspaceTheme}`}>
			<aside className={`fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r p-5 lg:flex ${panelTheme}`}>
				<Link href="/Dashboard" className="mb-8 flex items-center gap-3 rounded-xl px-2 py-1">
					<span className="grid size-11 place-items-center rounded-2xl bg-emerald-600 text-xl text-white">✿</span>
					<span><strong className="block text-sm">Pasar Splendid</strong><small className={`${textMuted} text-xs`}>Panel administrasi</small></span>
				</Link>
				<nav className="space-y-1">
					{navigation.map((item) => {
						const active = pathname === item.href || (item.href === "/PengelolaanBunga" && pathname === "/PasarBunga") || (item.href === "/PengelolaanPerlengkapan" && pathname === "/PasarPerlengkapan");
						return (
							<Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : `${textMuted} hover:bg-slate-100 dark:hover:bg-slate-800`}`}>
								<span className="grid size-6 place-items-center text-base">{item.icon}</span>{item.label}
							</Link>
						);
					})}
				</nav>
				<div className={`mt-auto rounded-2xl border p-4 ${panelTheme}`}>
					<div className="font-semibold">{profileName || currentAdmin?.name || "Admin"}</div>
					<div className={`mt-1 truncate text-xs ${textMuted}`}>{currentAdmin?.email ?? "Sesi admin aktif"}</div>
					<button data-auth-logout="true" className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950">Keluar</button>
				</div>
			</aside>

			<div className="min-w-0 lg:pl-64">
				<header className={`sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b px-4 sm:px-7 ${panelTheme}`}>
					<div className="min-w-0">
						<div className={`text-xs ${textMuted}`}>Pasar Splendid / Admin</div>
						<h1 className="truncate text-lg font-bold sm:text-xl">{currentTitle}</h1>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						{route.mode === "list" && <Button onClick={() => setReloadKey((current) => current + 1)}>↻ <span className="hidden sm:inline">Muat ulang</span></Button>}
						{route.mode === "list" && <Button variant="primary" onClick={openCreate}>＋ <span className="hidden sm:inline">Tambah data</span></Button>}
						<button data-auth-logout="true" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 lg:hidden">Keluar</button>
					</div>
				</header>

				<nav className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4 py-3 lg:hidden">
					{navigation.map((item) => <Link key={item.href} href={item.href} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${pathname === item.href ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600"}`}>{item.label}</Link>)}
				</nav>

				<main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-7">
					{toast && <div role="status" className="fixed right-4 top-20 z-40 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
					{pageError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{pageError}</span><Button onClick={() => { setPageError(""); setReloadKey((current) => current + 1); }}>Coba lagi</Button></div>}

					{route.mode === "dashboard" && (
						<DashboardView counts={dashboardCounts} loading={isLoading} error={dashboardError} />
					)}

					{route.mode === "list" && collection && (
						<section className="space-y-5">
							<div className="flex flex-wrap items-end justify-between gap-3">
								<div>
									<p className={`text-sm ${textMuted}`}>Kelola data {collection.label.toLocaleLowerCase("id-ID")} dari satu tempat.</p>
									<p className={`mt-1 text-xs ${textMuted}`}>{records.length} data tersimpan</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button onClick={exportCsv} disabled={filteredRecords.length === 0}>⇩ Ekspor CSV</Button>
									{selectedIds.length > 0 && <Button variant="danger" onClick={() => setDeleteTarget({ id: "selected", name: `${selectedIds.length} data terpilih` })}>Hapus pilihan ({selectedIds.length})</Button>}
								</div>
							</div>

							<div className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-[minmax(0,1fr)_12rem_8rem] ${panelTheme}`}>
								<label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 dark:border-slate-700">
									<span aria-hidden="true" className={textMuted}>⌕</span>
									<input aria-label={`Cari ${collection.label}`} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400" placeholder={`Cari ${collection.label.toLocaleLowerCase("id-ID")}…`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
								</label>
								<select aria-label="Filter status" className="rounded-xl border border-slate-200 bg-transparent px-3 py-3 text-sm dark:border-slate-700" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
									<option value="all">Semua status</option><option value="aktif">Aktif</option><option value="tidak aktif">Tidak aktif</option>
								</select>
								<select aria-label="Jumlah data per halaman" className="rounded-xl border border-slate-200 bg-transparent px-3 py-3 text-sm dark:border-slate-700" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
									<option value={10}>10 per halaman</option><option value={25}>25 per halaman</option><option value={50}>50 per halaman</option>
								</select>
							</div>

							<div className={`overflow-hidden rounded-2xl border ${panelTheme}`}>
								<div className="hidden grid-cols-[2rem_minmax(0,1.4fr)_minmax(7rem,1fr)_minmax(7rem,.7fr)_minmax(6rem,.6fr)_10rem] items-center gap-3 border-b border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid dark:border-slate-800">
									<input aria-label="Pilih semua data pada halaman" type="checkbox" checked={allVisibleSelected} onChange={toggleSelectVisible} />
									<span>Nama</span><span>Kategori</span><span>Harga</span><span>Status</span><span className="text-right">Aksi</span>
								</div>
								{isLoading ? <div className={`p-10 text-center text-sm ${textMuted}`}>Memuat data…</div> : pageRecords.length === 0 ? (
									<div className="px-6 py-14 text-center">
										<div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">{collection.singular.slice(0, 1)}</div>
										<h2 className="mt-4 font-bold">{records.length === 0 ? "Belum ada data" : "Data tidak ditemukan"}</h2>
										<p className={`mx-auto mt-1 max-w-md text-sm ${textMuted}`}>{records.length === 0 ? `Tambahkan ${collection.singular.toLocaleLowerCase("id-ID")} pertama agar data muncul di sini.` : "Coba ubah kata pencarian atau filter status."}</p>
										{records.length === 0 && <div className="mt-5"><Button variant="primary" onClick={openCreate}>＋ Tambah data pertama</Button></div>}
									</div>
								) : (
									<div className="divide-y divide-slate-100 dark:divide-slate-800">
										{pageRecords.map((item) => {
											const active = String(item.status ?? "").toLocaleLowerCase("id-ID") === "aktif";
											return (
												<div key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(7rem,1fr)_minmax(7rem,.7fr)_minmax(6rem,.6fr)_10rem] md:items-center md:px-5">
													<input aria-label={`Pilih ${primaryText(item)}`} type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />
													<button onClick={() => setDetailRecord(item)} className="min-w-0 text-left">
														<strong className="block truncate text-sm">{primaryText(item)}</strong>
														<span className={`mt-1 block truncate text-xs ${textMuted}`}>{typeof item.description === "string" ? item.description : typeof item.email === "string" ? item.email : `Diperbarui ${formatDate(item.updatedAt)}`}</span>
													</button>
													<span className="text-sm text-slate-600 dark:text-slate-300"><span className="mr-2 text-xs text-slate-400 md:hidden">Kategori</span>{displayValue(item.category ?? item.sector ?? item.role)}</span>
													<span className="text-sm font-semibold text-slate-700 dark:text-slate-200"><span className="mr-2 text-xs text-slate-400 md:hidden">Harga / stok</span>{item.price !== undefined ? formatCurrency(item.price) : displayValue(item.stock)}</span>
													<span><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : item.status ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : "text-slate-400"}`}>{displayValue(item.status)}</span></span>
													<div className="flex flex-wrap gap-2 md:justify-end">
														{collectionName === "market_locations" && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([item.latitude, item.longitude].filter(Boolean).join(",") || [primaryText(item), item.sector].filter(Boolean).join(" "))}`} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950">Lihat peta</a>}
														<Link href={editUrl(item.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Ubah</Link>
														<button onClick={() => requestDelete(item)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950">Hapus</button>
													</div>
												</div>
										);
										})}
									</div>
								)}
							</div>

							<div className="flex flex-wrap items-center justify-between gap-3 text-sm">
								<span className={textMuted}>Menampilkan {filteredRecords.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredRecords.length)} dari {filteredRecords.length} data</span>
								<div className="flex gap-2"><Button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}>Sebelumnya</Button><Button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page >= pageCount}>Berikutnya</Button></div>
							</div>
						</section>
					)}

					{(route.mode === "create" || route.mode === "edit") && collection && (
						<section className={`mx-auto max-w-3xl rounded-2xl border p-5 sm:p-7 ${panelTheme}`}>
							<div className="mb-6">
								<p className={`text-sm ${textMuted}`}>{route.mode === "create" ? `Isi informasi ${collection.singular.toLocaleLowerCase("id-ID")} baru.` : "Perbarui informasi lalu simpan perubahan."}</p>
								{route.mode === "edit" && <p className={`mt-1 text-xs ${textMuted}`}>ID data: {recordId || "belum dipilih"}</p>}
							</div>
							{route.mode === "edit" && isLoading ? <p className={`py-8 text-center ${textMuted}`}>Memuat data…</p> : route.mode === "edit" && !record ? (
								<div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Data tidak ditemukan. Buka halaman ini dari tombol Ubah pada daftar data.</div>
							) : (
								<form onSubmit={handleRecordSubmit} className="space-y-5">
									<div className="grid gap-4 sm:grid-cols-2">
										{collection.fields.map((field) => <FieldInput key={field.key} field={field} value={formValues[field.key] ?? (field.key === "status" && route.mode === "create" ? "Aktif" : "")} onChange={(value) => setFormValues((current) => ({ ...current, [field.key]: value }))} />)}
									</div>
									<details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
										<summary className="cursor-pointer text-sm font-semibold">Data tambahan (opsional)</summary>
										<p className={`mt-2 text-xs ${textMuted}`}>Gunakan JSON untuk menyimpan kolom khusus. Contoh: {`{"imageUrl":"https://…"}`}</p>
										<textarea value={extraJson} onChange={(event) => setExtraJson(event.target.value)} className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 bg-transparent p-3 font-mono text-xs outline-none focus:border-emerald-500 dark:border-slate-700" spellCheck={false} />
									</details>
									{formError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>}
									<div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
										<Button onClick={() => router.push(listPaths[collectionName] ?? "/Dashboard")}>Batal</Button>
										<Button type="submit" variant="primary" disabled={isSaving || (route.mode === "edit" && !record)}>{isSaving ? "Menyimpan…" : route.mode === "create" ? "Simpan data" : "Simpan perubahan"}</Button>
									</div>
								</form>
							)}
						</section>
					)}

					{route.mode === "delete" && collection && (
						<section className={`mx-auto max-w-xl rounded-2xl border p-6 sm:p-8 ${panelTheme}`}>
							<div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-2xl text-rose-600">!</div>
							<h2 className="mt-4 text-center text-xl font-bold">Hapus {collection.singular.toLocaleLowerCase("id-ID")}?</h2>
							{isLoading ? <p className={`mt-2 text-center text-sm ${textMuted}`}>Memuat data…</p> : record ? <p className={`mt-2 text-center text-sm ${textMuted}`}>Data <strong className="text-slate-900 dark:text-white">{primaryText(record)}</strong> akan dihapus permanen.</p> : <p className="mt-2 text-center text-sm text-amber-700">Data tidak ditemukan. Pilih data dari daftar untuk menghapusnya.</p>}
							<div className="mt-6 flex flex-wrap justify-center gap-2"><Button onClick={() => router.push(listPaths[collectionName] ?? "/Dashboard")}>Batal</Button><Button variant="danger" disabled={!record || isDeleting} onClick={() => record && void performDelete(record)}>{isDeleting ? "Menghapus…" : "Ya, hapus data"}</Button></div>
						</section>
					)}

					{route.mode === "settings" && (
						<SettingsView
							admin={currentAdmin}
							profileName={profileName}
							setProfileName={setProfileName}
							isBusy={settingsBusy}
							notificationsEnabled={notificationsEnabled}
							darkMode={darkMode}
							onSaveProfile={saveProfile}
							onToggleNotifications={toggleNotifications}
							onToggleDarkMode={toggleDarkMode}
							newAdmin={newAdmin}
							setNewAdmin={setNewAdmin}
							onRegisterAdmin={registerAdmin}
							passwordChange={passwordChange}
							setPasswordChange={setPasswordChange}
							onChangePassword={changePassword}
						/>
					)}
				</main>
			</div>

			{detailRecord && <Modal title={primaryText(detailRecord)} onClose={() => setDetailRecord(null)}><div className="divide-y divide-slate-100 dark:divide-slate-800">{Object.entries(detailRecord).map(([key, value]) => <div key={key} className="grid grid-cols-[minmax(7rem,.7fr)_minmax(0,1fr)] gap-4 py-2 text-sm"><span className="font-medium capitalize text-slate-500">{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</span><span className="break-words">{displayValue(value)}</span></div>)}</div></Modal>}
			{deleteTarget && <Modal title="Konfirmasi penghapusan" onClose={() => setDeleteTarget(null)}><p className="text-sm text-slate-600 dark:text-slate-300">{deleteTarget.id === "selected" ? `Hapus ${selectedIds.length} data yang dipilih? Tindakan ini tidak dapat dibatalkan.` : <>Hapus <strong>{primaryText(deleteTarget)}</strong>? Tindakan ini tidak dapat dibatalkan.</>}</p><div className="mt-6 flex justify-end gap-2"><Button onClick={() => setDeleteTarget(null)}>Batal</Button><Button variant="danger" disabled={isDeleting} onClick={() => deleteTarget.id === "selected" ? void deleteSelected() : void performDelete(deleteTarget)}>{isDeleting ? "Menghapus…" : "Hapus"}</Button></div></Modal>}
		</div>
	);
}

function DashboardView({ counts, loading, error }: { counts: Record<string, number>; loading: boolean; error: string }) {
	const cards = [
		{ key: "flowers", label: "Bunga", href: "/PengelolaanBunga", icon: "✿" },
		{ key: "birds", label: "Burung", href: "/PengelolaanKategoriBurung", icon: "♧" },
		{ key: "fish", label: "Ikan hias", href: "/PengelolaanIkanHias", icon: "≈" },
		{ key: "pets", label: "Hewan peliharaan", href: "/HewanPeliharaan", icon: "♡" },
		{ key: "supplies", label: "Perlengkapan", href: "/PengelolaanPerlengkapan", icon: "▤" },
		{ key: "inventory", label: "Inventaris", href: "/PengelolaanInventaris", icon: "▦" },
	];
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	return (
		<section className="space-y-6">
			<div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-6 text-white shadow-sm sm:p-8">
				<p className="text-sm font-semibold text-emerald-50">Ringkasan Pasar Splendid</p>
				<h2 className="mt-2 text-2xl font-bold sm:text-3xl">Selamat datang di panel admin</h2>
				<p className="mt-2 max-w-2xl text-sm text-emerald-50">Pantau katalog, inventaris, pengguna, forum, dan lokasi pasar dari satu tempat.</p>
				<div className="mt-6 flex flex-wrap gap-3"><div className="rounded-2xl bg-white/15 px-4 py-3"><span className="block text-2xl font-bold">{loading ? "…" : total}</span><span className="text-xs text-emerald-50">total data</span></div><Link href="/PengelolaanInventaris" className="inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Buka inventaris →</Link></div>
			</div>
			{error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{cards.map((card) => <Link href={card.href} key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{card.icon}</span><span className="text-sm font-semibold text-emerald-700">Lihat data →</span></div><p className="mt-5 text-3xl font-bold">{loading ? "…" : counts[card.key] ?? 0}</p><p className="mt-1 text-sm text-slate-500">{card.label}</p></Link>)}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<QuickLink href="/User" title="Kelola pengguna" text={`${loading ? "Memuat" : counts.users ?? 0} profil pengguna terdaftar`} />
				<QuickLink href="/ForumKomunitas" title="Forum komunitas" text={`${loading ? "Memuat" : counts.community_posts ?? 0} kiriman komunitas`} />
				<QuickLink href="/PetaLokasiPasar" title="Lokasi pasar" text={`${loading ? "Memuat" : counts.market_locations ?? 0} titik lokasi tercatat`} />
				<QuickLink href="/Pengaturan" title="Pengaturan akun" text="Atur profil, keamanan, dan preferensi panel" />
			</div>
		</section>
	);
}

function QuickLink({ href, title, text }: { href: string; title: string; text: string }) {
	return <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"><strong className="block">{title}</strong><span className="mt-1 block text-sm text-slate-500">{text}</span></Link>;
}

function SettingsView({
	admin,
	profileName,
	setProfileName,
	isBusy,
	notificationsEnabled,
	darkMode,
	onSaveProfile,
	onToggleNotifications,
	onToggleDarkMode,
	newAdmin,
	setNewAdmin,
	onRegisterAdmin,
	passwordChange,
	setPasswordChange,
	onChangePassword,
}: {
	admin: AdminIdentity | null;
	profileName: string;
	setProfileName: (value: string) => void;
	isBusy: boolean;
	notificationsEnabled: boolean;
	darkMode: boolean;
	onSaveProfile: (event: FormEvent<HTMLFormElement>) => void;
	onToggleNotifications: () => void;
	onToggleDarkMode: () => void;
	newAdmin: { name: string; email: string; password: string };
	setNewAdmin: (value: { name: string; email: string; password: string }) => void;
	onRegisterAdmin: (event: FormEvent<HTMLFormElement>) => void;
	passwordChange: { currentPassword: string; newPassword: string };
	setPasswordChange: (value: { currentPassword: string; newPassword: string }) => void;
	onChangePassword: (event: FormEvent<HTMLFormElement>) => void;
}) {
	const control = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950";
	return (
		<section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)]">
			<div className="space-y-5">
				<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
					<h2 className="text-lg font-bold">Profil admin</h2><p className="mt-1 text-sm text-slate-500">Nama profil tersimpan untuk panel admin ini.</p>
					<form onSubmit={onSaveProfile} className="mt-5 space-y-4">
						<label className="block space-y-1.5 text-sm font-medium">Nama tampilan<input className={control} required value={profileName} onChange={(event) => setProfileName(event.target.value)} /></label>
						<label className="block space-y-1.5 text-sm font-medium">Email akun<input className={`${control} bg-slate-50 dark:bg-slate-900`} readOnly value={admin?.email ?? ""} /></label>
						<div className="flex justify-end"><Button type="submit" variant="primary" disabled={isBusy || !admin}>Simpan profil</Button></div>
					</form>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
					<h2 className="text-lg font-bold">Keamanan akun</h2><p className="mt-1 text-sm text-slate-500">Kata sandi baru harus terdiri dari 12–128 karakter.</p>
					<form onSubmit={onChangePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
						<label className="block space-y-1.5 text-sm font-medium">Kata sandi saat ini<input type="password" autoComplete="current-password" className={control} required value={passwordChange.currentPassword} onChange={(event) => setPasswordChange({ ...passwordChange, currentPassword: event.target.value })} /></label>
						<label className="block space-y-1.5 text-sm font-medium">Kata sandi baru<input type="password" autoComplete="new-password" minLength={12} maxLength={128} className={control} required value={passwordChange.newPassword} onChange={(event) => setPasswordChange({ ...passwordChange, newPassword: event.target.value })} /></label>
						<div className="sm:col-span-2 flex justify-end"><Button type="submit" variant="primary" disabled={isBusy}>Perbarui kata sandi</Button></div>
					</form>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
					<h2 className="text-lg font-bold">Preferensi</h2>
					<PreferenceRow title="Pemberitahuan tindakan" text="Tampilkan pesan setelah data berhasil disimpan atau dihapus." enabled={notificationsEnabled} onToggle={onToggleNotifications} />
					<PreferenceRow title="Mode gelap" text="Simpan tampilan pilihan di perangkat ini." enabled={darkMode} onToggle={onToggleDarkMode} />
				</div>
			</div>
			<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
				<h2 className="text-lg font-bold">Tambah akun admin</h2><p className="mt-1 text-sm text-slate-500">Akun baru dapat masuk setelah dibuat. Kata sandi minimal 12 karakter.</p>
				<form onSubmit={onRegisterAdmin} className="mt-5 space-y-4">
					<label className="block space-y-1.5 text-sm font-medium">Nama<input className={control} required minLength={2} maxLength={120} value={newAdmin.name} onChange={(event) => setNewAdmin({ ...newAdmin, name: event.target.value })} /></label>
					<label className="block space-y-1.5 text-sm font-medium">Email<input type="email" className={control} required maxLength={254} value={newAdmin.email} onChange={(event) => setNewAdmin({ ...newAdmin, email: event.target.value })} /></label>
					<label className="block space-y-1.5 text-sm font-medium">Kata sandi sementara<input type="password" autoComplete="new-password" className={control} required minLength={12} maxLength={128} value={newAdmin.password} onChange={(event) => setNewAdmin({ ...newAdmin, password: event.target.value })} /></label>
					<Button type="submit" variant="primary" disabled={isBusy}>Buat akun admin</Button>
				</form>
			</div>
		</section>
	);
}

function PreferenceRow({ title, text, enabled, onToggle }: { title: string; text: string; enabled: boolean; onToggle: () => void }) {
	return <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800"><div><strong className="text-sm">{title}</strong><p className="mt-1 text-xs text-slate-500">{text}</p></div><button type="button" role="switch" aria-checked={enabled} aria-label={title} onClick={onToggle} className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-1 size-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} /></button></div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
	return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-100 sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><h2 className="text-lg font-bold">{title}</h2><button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">×</button></div>{children}</section></div>;
}
