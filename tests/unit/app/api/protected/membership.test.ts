import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { session } from "../../../helpers";

import { GET } from "@/app/api/protected/membership/route";
import { verifyMembershipByEmail } from "@/miniservices/memberMiniService";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");

describe("GET /api/protected/membership", () => {
  it("returns 401 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });

  it("returns 403 for a signed-in non-member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(verifyMembershipByEmail).mockResolvedValue(false);

    expect((await GET()).status).toBe(403);
  });

  it("returns 403 without checking the DB when the session has no email", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(null));

    expect((await GET()).status).toBe(403);
    expect(verifyMembershipByEmail).not.toHaveBeenCalled();
  });

  it("confirms a member", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(verifyMembershipByEmail).mockResolvedValue(true);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Membership verified",
      user: "alice@purdue.edu",
    });
  });
});
