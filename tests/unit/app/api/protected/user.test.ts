import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { session } from "../../../helpers";

import { GET as getUser } from "@/app/api/protected/user/route";
import { GET as getUserTrips } from "@/app/api/protected/user/trips/route";
import { getMemberByEmail } from "@/miniservices/memberMiniService";
import { getTripsByMemberId } from "@/miniservices/tripMiniService";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/tripMiniService");

describe.each([
  ["/api/protected/user", getUser],
  ["/api/protected/user/trips", getUserTrips],
])("GET %s", (_, GET) => {
  it("returns 403 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await GET()).status).toBe(403);
  });

  it("returns 404 when the email is not a member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue(null);

    expect((await GET()).status).toBe(404);
  });

  it("returns 500 when a lookup throws", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockRejectedValue(new Error("boom"));

    expect((await GET()).status).toBe(500);
  });
});

describe("signed-in member", () => {
  it("GET /api/protected/user returns the member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 1, name: "Alice" });

    const response = await getUser();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1, name: "Alice" });
    expect(getMemberByEmail).toHaveBeenCalledWith("alice@purdue.edu");
  });

  it("GET /api/protected/user/trips returns that member's trips", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 1 });
    vi.mocked(getTripsByMemberId).mockResolvedValue([
      { tripId: 2, name: "Smokies" },
    ]);

    const response = await getUserTrips();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ tripId: 2, name: "Smokies" }]);
    expect(getTripsByMemberId).toHaveBeenCalledWith(1);
  });
});
