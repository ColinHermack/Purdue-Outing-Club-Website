import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { session } from "../../../helpers";

import { GET } from "@/app/api/protected/memberdirectory/route";
import {
  getMemberByEmail,
  getMemberDirectory,
} from "@/miniservices/memberMiniService";
import { getTripLeader } from "@/miniservices/tripLeaderMiniService";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/tripLeaderMiniService");

describe("GET /api/protected/memberdirectory", () => {
  it("returns 403 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await GET()).status).toBe(403);
  });

  it("returns 404 when the email is not a member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue(null);

    expect((await GET()).status).toBe(404);
  });

  it("returns 401 for a member who is not a trip leader", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 2 });
    vi.mocked(getTripLeader).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
    expect(getMemberDirectory).not.toHaveBeenCalled();
  });

  it("returns the directory to a trip leader", async () => {
    const directory = [{ id: 1, name: "Alice", isActive: true }];

    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 1 });
    vi.mocked(getTripLeader).mockResolvedValue({ member: { id: 1 } });
    vi.mocked(getMemberDirectory).mockResolvedValue(directory);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(directory);
  });

  it("returns 500 when a lookup throws", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockRejectedValue(new Error("boom"));

    expect((await GET()).status).toBe(500);
  });
});
