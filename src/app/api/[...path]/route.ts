type RouteContext = {
	params: Promise<{ path: string[] }>;
};

const backendBaseUrl = (process.env.BACKEND_API_URL ?? "http://127.0.0.1:4000/api").replace(/\/+$/, "");
const hopByHopHeaders = [
	"connection",
	"content-encoding",
	"content-length",
	"host",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
];

async function forward(request: Request, context: RouteContext): Promise<Response> {
	const { path } = await context.params;
	const incomingUrl = new URL(request.url);
	const apiPath = path.map((segment) => encodeURIComponent(segment)).join("/");
	const upstreamUrl = `${backendBaseUrl}/${apiPath}${incomingUrl.search}`;
	const headers = new Headers(request.headers);
	for (const header of [...hopByHopHeaders, "origin", "referer"]) headers.delete(header);

	try {
		const upstream = await fetch(upstreamUrl, {
			method: request.method,
			headers,
			body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
			cache: "no-store",
			signal: AbortSignal.timeout(15_000),
		});
		const responseHeaders = new Headers(upstream.headers);
		for (const header of hopByHopHeaders) responseHeaders.delete(header);
		return new Response(upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		const timedOut = error instanceof Error && error.name === "TimeoutError";
		return Response.json(
			{
				error: timedOut
					? "Backend tidak merespons dalam 15 detik. Periksa layanan API dan database."
					: "Backend tidak dapat dihubungi. Jalankan MySQL dan server backend terlebih dahulu.",
			},
			{ status: timedOut ? 504 : 503 },
		);
	}
}

export const GET = forward;
export const HEAD = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const OPTIONS = forward;
