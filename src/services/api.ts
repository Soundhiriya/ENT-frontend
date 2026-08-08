import { toast } from "sonner";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
    status: number;
    fieldErrors?: Record<string, string>;
    // Set only on 429s — how long to wait before the request can succeed.
    // Sourced from the response body first (retryAfterSeconds), falling back
    // to the standard Retry-After header so either survives on its own.
    retryAfterSeconds?: number;

    constructor(
        message: string,
        status: number,
        fieldErrors?: Record<string, string>,
        retryAfterSeconds?: number
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

function extractRetryAfterSeconds(response: Response, data: any): number | undefined {
    if (typeof data?.retryAfterSeconds === "number") {
        return data.retryAfterSeconds;
    }
    const header = response.headers.get("Retry-After");
    const parsed = header ? Number(header) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
}

async function doFetch(endpoint: string, options?: RequestInit) {
    const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string> ?? {}),
    };

    if (!(options?.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
        ...options,
        headers,
    });

    // Some responses (e.g. 204 No Content, like /public/logout) have no
    // body at all — response.json() throws on an empty body, so read as
    // text first and only parse if there's actually something there.
    const text = await response.text();
    let data: any = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    return { response, data };
}

// Concurrent requests that all hit a 401 at once share this one in-flight
// refresh instead of each firing their own /public/refresh call.
let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
    if (!refreshPromise) {
        refreshPromise = doFetch("/public/refresh", { method: "POST" })
            .then(({ response }) => response.ok)
            .catch(() => false)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

async function performRequest<T>(
    endpoint: string,
    options: RequestInit | undefined,
    isRetry: boolean
): Promise<T> {
    const { response, data } = await doFetch(endpoint, options);

    if (response.status === 401) {
        // Only an expired access token is worth refreshing for. Never
        // retry a call that's already been retried once, and never try
        // to refresh on behalf of the /public/* auth endpoints themselves
        // (e.g. a failed /public/refresh must not trigger another refresh).
        const isExpiredAccessToken = data?.error === "ACCESS_TOKEN_EXPIRED";
        const canRetry = isExpiredAccessToken && !isRetry && !endpoint.startsWith("/public/");

        if (canRetry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return performRequest<T>(endpoint, options, true);
            }
        }

        window.location.replace("/");
        throw new ApiError(data?.message ?? "Unauthorized", response.status, data?.fieldErrors);
    }

    if (!response.ok) {
        throw new ApiError(
            data?.message ?? "Something went wrong",
            response.status,
            data?.fieldErrors,
            response.status === 429 ? extractRetryAfterSeconds(response, data) : undefined
        );
    }

    return data;
}

export async function request<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    return performRequest<T>(endpoint, options, false);
}

// Downloads a binary response (Excel/PDF report, etc.) and saves it via the
// browser's download flow — separate from request() because that always
// JSON-parses the body, which a file response isn't.
async function performDownload(endpoint: string, isRetry: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: "include",
    });

    if (response.status === 401) {
        const canRetry = !isRetry;

        if (canRetry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return performDownload(endpoint, true);
            }
        }

        window.location.replace("/");
        throw new ApiError("Unauthorized", 401);
    }

    if (!response.ok) {
        let message = "Failed to download file";
        try {
            const data = await response.json();
            message = data?.message ?? message;
        } catch {
            // Error response wasn't JSON — keep the default message.
        }
        throw new ApiError(message, response.status);
    }

    const blob = await response.blob();

    const disposition = response.headers.get("Content-Disposition") ?? "";
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] ?? "download";

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export function downloadFile(endpoint: string): Promise<void> {
    return performDownload(endpoint, false);
}
