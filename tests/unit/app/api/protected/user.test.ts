import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { session } from "../../../helpers";

import { GET as getUser } from "@/app/api/protected/user/route";
import { GET as getAccess } from "@/app/api/protected/user/access/route";
import { GET as getUserTrips } from "@/app/api/protected/user/trips/route";
import { getMemberByEmail } from "@/miniservices/memberMiniService";
import { getTripsByMemberId } from "@/miniservices/tripMiniService";
import { getMemberAccess } from "@/utils/memberAccess";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/tripMiniService");
vi.mock("@/utils/memberAccess", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/memberAccess")>()),
  getMemberAccess: vi.fn(),
}));

const allowed = {
  isMember: true,
  isOfficer: false,
  isTripLeader: true,
  name: "Alice",
  tools: [],
};

describe.each([
  ["/api/protected/user", getUser],
  ["/api/protected/user/trips", getUserTrips],
])("GET %s", (_, GET) => {
  it("returns 401 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });

  it("returns 404 when the email is not a member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue(null);

    expect((await GET()).status).toBe(404);
  });

  it("returns 403 for a member who is neither officer nor trip leader", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 1 });
    vi.mocked(getMemberAccess).mockResolvedValue({
      ...allowed,
      isTripLeader: false,
    });

    expect((await GET()).status).toBe(403);
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
    vi.mocked(getMemberAccess).mockResolvedValue(allowed);

    const response = await getUser();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1, name: "Alice" });
    expect(getMemberByEmail).toHaveBeenCalledWith("alice@purdue.edu");
  });

  it("GET /api/protected/user/trips returns that member's trips", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 1 });
    vi.mocked(getMemberAccess).mockResolvedValue(allowed);
    vi.mocked(getTripsByMemberId).mockResolvedValue([
      { tripId: 2, name: "Smokies" },
    ]);

    const response = await getUserTrips();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ tripId: 2, name: "Smokies" }]);
    expect(getTripsByMemberId).toHaveBeenCalledWith(1);
  });
});

describe("GET /api/protected/user/access", () => {
  it("returns 401 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await getAccess()).status).toBe(401);
  });

  it("returns 403 when not allowed to sign in", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberAccess).mockResolvedValue({
      ...allowed,
      isTripLeader: false,
    });

    expect((await getAccess()).status).toBe(403);
  });

  it("returns name, email and tools", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberAccess).mockResolvedValue({
      ...allowed,
      tools: ["memberDirectory"],
    });

    const response = await getAccess();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      name: "Alice",
      email: "alice@purdue.edu",
      tools: ["memberDirectory"],
    });
  });
});
