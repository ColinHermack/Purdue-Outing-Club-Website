import type { User } from "next-auth";
import { describe, expect, it, vi } from "vitest";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { verifyMembershipByEmail } from "@/miniservices/memberMiniService";

vi.mock("@/miniservices/memberMiniService");

const signIn = (email?: string | null) =>
  authOptions.callbacks!.signIn!({ user: { id: "1", email } as User } as never);

describe("authOptions.signIn", () => {
  it("lets club members in", async () => {
    vi.mocked(verifyMembershipByEmail).mockResolvedValue(true);

    expect(await signIn("alice@purdue.edu")).toBe(true);
    expect(verifyMembershipByEmail).toHaveBeenCalledWith("alice@purdue.edu");
  });

  it("rejects anyone not in the member table", async () => {
    vi.mocked(verifyMembershipByEmail).mockResolvedValue(false);

    expect(await signIn("stranger@purdue.edu")).toBe(false);
  });

  it("rejects when the membership check throws", async () => {
    vi.mocked(verifyMembershipByEmail).mockRejectedValue(new Error("db down"));

    expect(await signIn("alice@purdue.edu")).toBe(false);
  });

  it("checks an empty email when the account has none", async () => {
    vi.mocked(verifyMembershipByEmail).mockResolvedValue(false);

    expect(await signIn(null)).toBe(false);
    expect(verifyMembershipByEmail).toHaveBeenCalledWith("");
  });
});
