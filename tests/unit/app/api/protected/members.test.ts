import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { session } from "../../../helpers";

import { GET } from "@/app/api/protected/members/route";
import { getMemberByEmail, getMembers } from "@/miniservices/memberMiniService";
import { verifyMemberIsOfficer } from "@/miniservices/officerMiniService";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/officerMiniService");

describe("GET /api/protected/members", () => {
  it("returns 403 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await GET()).status).toBe(403);
  });

  it("returns 401 when the email is not a member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });

  it("returns 401 for a member who is not an officer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 2 });
    vi.mocked(verifyMemberIsOfficer).mockResolvedValue(false);

    expect((await GET()).status).toBe(401);
    expect(verifyMemberIsOfficer).toHaveBeenCalledWith(2);
  });

  it("returns only id, name and email to an officer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockResolvedValue({ id: 1 });
    vi.mocked(verifyMemberIsOfficer).mockResolvedValue(true);
    vi.mocked(getMembers).mockResolvedValue([
      {
        id: 1,
        name: "Alice",
        email: "alice@purdue.edu",
        phone: "555",
        medicalData: {},
      },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { id: 1, name: "Alice", email: "alice@purdue.edu" },
    ]);
  });

  it("returns 500 when a lookup throws", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberByEmail).mockRejectedValue(new Error("boom"));

    expect((await GET()).status).toBe(500);
  });
});
