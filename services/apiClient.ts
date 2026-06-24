// Resilient JSON fetch wrapper with timeout, retry + backoff, and Next.js
// data-cache revalidation. Server-side only. Used by every data source.

const API_KEY = process.env.THESPORTSDB_KEY ?? "3"; // "3" = free public test key
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;
const DEFAULT_REVALIDATE = 60; // 1 minute — keep data fresh by default

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions {
  /** Seconds before the Next.js data cache is considered stale. */
  revalidate?: number;
  retries?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a full URL and parse JSON. Retries transient failures (network / 5xx /
 * timeout) with exponential backoff. Generic across data sources.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    revalidate = DEFAULT_REVALIDATE,
    retries = DEFAULT_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    if (signal) {
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        next: { revalidate },
      });

      if (!res.ok) {
        // Retry server errors; fail fast on client errors.
        if (res.status >= 500 && attempt < retries) {
          throw new ApiError(`Upstream ${res.status}`, res.status);
        }
        throw new ApiError(`Request failed with ${res.status}`, res.status);
      }

      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      // Don't retry definitive client errors.
      if (error instanceof ApiError && error.status && error.status < 500) {
        throw error;
      }
      if (attempt < retries) {
        await sleep(2 ** attempt * 250); // 250ms, 500ms, ...
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw new ApiError(
    `Request failed after ${retries + 1} attempts`,
    undefined,
    lastError,
  );
}

/** TheSportsDB-specific helper: resolves a path against the league base URL. */
export function sdbFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  return fetchJson<T>(`${BASE_URL}${path}`, options);
}
