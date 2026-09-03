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

// [AUTH-DIAG] TEMPORARY diagnostic logging for the mobile auto-logout
// investigation. Logging only — changes no behavior, and deliberately never
// logs tokens, cookies, headers, or any response body. The ISO timestamp is
// there to line these up against `docker compose logs -f backend`.
// Remove every authLog() call (grep "AUTH-DIAG") once the cause is found.
function authLog(...parts: unknown[]) {
    console.log("[AUTH]", new Date().toISOString(), ...parts);
}

// Concurrent requests within a tab that all hit a 401 at once share this one
// in-flight refresh instead of each firing their own /public/refresh call.
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
    authLog("refresh attempt started"); // [AUTH-DIAG]
    try {
        const { response } = await doFetch("/public/refresh", { method: "POST" });
        authLog("refresh response status:", response.status, "| ok:", response.ok); // [AUTH-DIAG]
        return response.ok;
    } catch (err) {
        authLog("refresh request failed (network/CORS):", String(err)); // [AUTH-DIAG]
        return false;
    }
}

// Tabs share cookies, so two tabs independently calling /public/refresh
// around the same moment can collide: the second one arrives after the
// first has already rotated the refresh token, the server sees a reused
// (already-rotated-away) token, and revokes the *whole* session family -
// logging every tab out, not just the one that lost the race. The Web
// Locks API gives every tab on the origin a real mutex with no race
// window, so only one tab's refresh runs at a time; a tab that was
// waiting gets its turn after the cookies are already updated, so its
// own request/retry just works off the winner's refresh.
const supportsWebLocks =
    typeof navigator !== "undefined" && "locks" in navigator;

function refreshAccessToken(): Promise<boolean> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            return supportsWebLocks
                ? navigator.locks.request<Promise<boolean>>("auth:refresh", doRefresh)
                : doRefresh();
        })().finally(() => {
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
        // Any 401 on a protected endpoint is worth one refresh attempt — not
        // just ACCESS_TOKEN_EXPIRED. That narrower check used to gate this,
        // and it silently broke whenever the access cookie was *gone* rather
        // than expired: JwtFilter never parses a token it doesn't have, so
        // Spring Security answers "JWT token is missing or invalid" instead,
        // and the user was logged out with a perfectly good refresh token
        // still in the jar. A missing cookie is exactly as recoverable as an
        // expired one, and the cookie can go missing for reasons the server
        // never sees (browser eviction, storage pressure, ITP).
        //
        // The two guards below are what keep this safe: !isRetry means at
        // most one refresh per request, so no loops, and the /public/ check
        // keeps the auth endpoints themselves out of it (a failed
        // /public/refresh must never trigger another refresh).
        const canRetry = !isRetry && !endpoint.startsWith("/public/");

        // [AUTH-DIAG]
        authLog(
            "401 on", endpoint,
            "| error code:", data?.error,
            "| isRetry:", isRetry,
            "| canRetry:", canRetry
        );

        if (canRetry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return performRequest<T>(endpoint, options, true);
            }
        }

        // A 401 from /public/* (wrong login password, unregistered email on
        // forgotPassword, an expired setPassword token, ...) is a normal
        // business-logic error, not a dead session — there's no session to
        // kick out of yet. Redirecting here would reload the page out from
        // under the caller before its catch block can show the message.
        if (!endpoint.startsWith("/public/")) {
            // [AUTH-DIAG]
            authLog(
                "redirecting to / — reason: 401 on protected endpoint", endpoint,
                "| refresh was attempted:", canRetry
            );
            window.location.replace("/");
        }
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

        // [AUTH-DIAG]
        authLog("401 on download endpoint", endpoint, "| isRetry:", isRetry);

        if (canRetry) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return performDownload(endpoint, true);
            }
        }

        // [AUTH-DIAG]
        authLog(
            "redirecting to / — reason: 401 on download endpoint", endpoint,
            "| refresh was attempted:", canRetry
        );
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
