import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { protectedFetch } from "@/utils/protectedFetch";

const fetchMock = vi.fn();
const assign = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("window", { location: { pathname: "/dashboard", assign } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("protectedFetch", () => {
  it("returns the parsed body on success", async () => {
    fetchMock.mockResolvedValue(Response.json([{ id: 1 }]));

    expect(await protectedFetch("/api/protected/user")).toEqual({
      status: "ok",
      data: [{ id: 1 }],
    });
  });

  it("passes request options through to fetch", async () => {
    fetchMock.mockResolvedValue(Response.json({}));
    const init = { method: "PUT", body: "{}" };

    await protectedFetch("/api/protected/tripleaders", init);

    expect(fetchMock).toHaveBeenCalledWith("/api/protected/tripleaders", init);
  });

  it("sends the browser to sign-in on 401, returning to the current page", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 401 }));

    const settled = vi.fn();

    protectedFetch("/api/protected/user").then(settled);
    await vi.waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        "/auth/signin?callbackUrl=%2Fdashboard",
      ),
    );
    expect(settled).not.toHaveBeenCalled();
  });

  it("reports forbidden on 403", async () => {
    fetchMock.mockResolvedValue(new Response("Forbidden", { status: 403 }));

    expect(await protectedFetch("/api/protected/user")).toEqual({
      status: "forbidden",
    });
    expect(assign).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a server error",
      () => Promise.resolve(new Response("", { status: 500 })),
    ],
    ["a non-JSON body", () => Promise.resolve(new Response("<html>"))],
    ["a network failure", () => Promise.reject(new TypeError("offline"))],
  ])("reports an error on %s", async (_, respond) => {
    fetchMock.mockImplementation(respond);

    expect(await protectedFetch("/api/protected/user")).toEqual({
      status: "error",
    });
  });
});
