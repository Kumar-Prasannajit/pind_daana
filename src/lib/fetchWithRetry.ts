/**
 * fetchWithRetry — A network-resilient fetch wrapper for slow/unstable networks.
 *
 * Features:
 *   • 10-second timeout via AbortController
 *   • Automatic retry (configurable, default 2 for GET, 0 for mutations)
 *   • Classified error messages for UX feedback
 */

export interface FetchWithRetryOptions extends RequestInit {
    /** Request timeout in milliseconds. Default: 10000 (10s) */
    timeout?: number;
    /** Number of retries on failure. Default: 2 for GET, 0 for mutations */
    retries?: number;
}

export class NetworkError extends Error {
    public isTimeout: boolean;
    public isRetryExhausted: boolean;

    constructor(message: string, { isTimeout = false, isRetryExhausted = false } = {}) {
        super(message);
        this.name = "NetworkError";
        this.isTimeout = isTimeout;
        this.isRetryExhausted = isRetryExhausted;
    }
}

/**
 * Performs a single fetch with an AbortController timeout.
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        return response;
    } catch (error: any) {
        if (error.name === "AbortError") {
            throw new NetworkError("Request timeout. Please try again.", { isTimeout: true });
        }
        throw new NetworkError("Network error. Check your connection.");
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Fetch with automatic retry logic.
 *
 * @param url     - The URL to fetch
 * @param options - Extended fetch options with timeout and retries
 * @returns       - The fetch Response
 * @throws        - NetworkError with classified message
 */
export async function fetchWithRetry(
    url: string,
    options: FetchWithRetryOptions = {}
): Promise<Response> {
    const method = (options.method || "GET").toUpperCase();
    const isReadOnly = method === "GET" || method === "HEAD";

    // Default retries: 2 for read-only, 0 for mutations (to avoid duplicate side-effects)
    const maxRetries = options.retries ?? (isReadOnly ? 2 : 0);
    const { retries: _retries, ...fetchOptions } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, fetchOptions);
            return response;
        } catch (error: any) {
            lastError = error;

            // If we have retries left, wait briefly before retrying
            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s
                const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }
        }
    }

    // All retries exhausted
    throw new NetworkError(
        "Request failed after retry. Please check your network and try again.",
        { isTimeout: lastError instanceof NetworkError && lastError.isTimeout, isRetryExhausted: true }
    );
}

export default fetchWithRetry;
