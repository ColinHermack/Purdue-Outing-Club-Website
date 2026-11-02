/**
 * Client-side fetch wrapper for /api/protected routes that turns the response into a state a page can render.
 *
 * @author Colin Hermack
 */

export type ProtectedResult<T> =
  | { status: "ok"; data: T }
  | { status: "forbidden" }
  | { status: "error" };

/**
 * Fetches a protected route and parses its JSON body. A 401 means the session expired, so the browser is sent to
 * sign-in and brought back to the current page afterwards; the returned promise never settles in that case.
 *
 * @param url The protected route to call.
 * @param init Options passed through to fetch.
 * @returns The parsed body, or whether the caller is forbidden or the request failed.
 */
export async function protectedFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<ProtectedResult<T>> {
  try {
    const response = await fetch(url, init);

    if (response.status === 401) {
      window.location.assign(
        `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );

      // Never settle, so the page keeps showing its loading state instead of an error while the browser navigates.
      return new Promise(() => {});
    }

    if (response.status === 403) return { status: "forbidden" };

    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as T };
  } catch {
    return { status: "error" };
  }
}
