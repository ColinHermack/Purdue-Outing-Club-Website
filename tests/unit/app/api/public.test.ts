import { describe, expect, it, vi } from "vitest";

import { GET as getGearHoursRoute } from "@/app/api/gear/hours/route";
import { GET as healthcheck } from "@/app/api/healthcheck/route";
import { GET as getLed } from "@/app/api/leaderboard/led/route";
import { GET as getTotal } from "@/app/api/leaderboard/total/route";
import { GET as getRecentNews } from "@/app/api/news/recent/route";
import { GET as getOpenTripsRoute } from "@/app/api/trips/open/route";
import { getPosts } from "@/app/news/utils";
import {
  getMostTripsAttended,
  getMostTripsLed,
} from "@/miniservices/memberMiniService";
import { getGearHours } from "@/miniservices/officerMiniService";
import { getOpenTrips } from "@/miniservices/tripMiniService";

vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/officerMiniService");
vi.mock("@/miniservices/tripMiniService");

describe("GET /api/healthcheck", () => {
  it("reports the API is online", async () => {
    const response = await healthcheck();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("API is online.");
  });
});

describe("GET /api/gear/hours", () => {
  it("returns gear officer hours", async () => {
    const hours = [
      { name: "Erin", gearhours: [{ day: "Monday", time: "5-7pm" }] },
    ];

    vi.mocked(getGearHours).mockResolvedValue(hours as never);

    const response = await getGearHoursRoute();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(hours);
  });

  it("returns 500 when the query fails", async () => {
    vi.mocked(getGearHours).mockRejectedValue(new Error("boom"));

    expect((await getGearHoursRoute()).status).toBe(500);
  });
});

describe("GET /api/trips/open", () => {
  it("returns open trips uncached", async () => {
    vi.mocked(getOpenTrips).mockResolvedValue([
      { tripId: 1, name: "Red River" },
    ]);

    const response = await getOpenTripsRoute();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(await response.json()).toEqual([{ tripId: 1, name: "Red River" }]);
  });
});

describe.each([
  ["led", getLed, getMostTripsLed, "tripsLed"],
  ["total", getTotal, getMostTripsAttended, "tripsAttended"],
] as const)("GET /api/leaderboard/%s", (_, GET, query, countKey) => {
  it("returns name and count pairs", async () => {
    vi.mocked(query).mockResolvedValue([
      { [countKey]: 4, member: { name: "Alice", email: "alice@purdue.edu" } },
    ] as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ name: "Alice", count: 4 }]);
  });

  it("returns 500 when the query fails", async () => {
    vi.mocked(query).mockRejectedValue(new Error("boom"));

    expect((await GET()).status).toBe(500);
  });
});

describe("GET /api/news/recent", () => {
  it("returns previews of the three newest posts", async () => {
    const response = await getRecentNews();
    const newest = getPosts().slice(0, 3);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      newest.map((post) => ({
        title: post.metadata.title,
        postedOn: post.metadata.postedOn,
        summary: post.metadata.summary,
        slug: post.slug,
      })),
    );
  });
});
