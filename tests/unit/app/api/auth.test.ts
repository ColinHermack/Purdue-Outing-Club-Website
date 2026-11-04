import type { User } from "next-auth";
import { describe, expect, it, vi } from "vitest";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getMemberAccess } from "@/utils/memberAccess";

vi.mock("@/utils/memberAccess", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/memberAccess")>()),
  getMemberAccess: vi.fn(),
}));

const signIn = (email?: string | null) =>
  authOptions.callbacks!.signIn!({ user: { id: "1", email } as User } as never);

const access = (overrides: object = {}) => ({
  isMember: true,
  isOfficer: false,
  isTripLeader: false,
  tools: [],
  ...overrides,
});

describe("authOptions.signIn", () => {
  it("lets trip leaders in", async () => {
    vi.mocked(getMemberAccess).mockResolvedValue(
      access({ isTripLeader: true }),
    );

    expect(await signIn("alice@purdue.edu")).toBe(true);
    expect(getMemberAccess).toHaveBeenCalledWith("alice@purdue.edu");
  });

  it("lets officers in", async () => {
    vi.mocked(getMemberAccess).mockResolvedValue(access({ isOfficer: true }));

    expect(await signIn("alice@purdue.edu")).toBe(true);
  });

  it("rejects plain members", async () => {
    vi.mocked(getMemberAccess).mockResolvedValue(access());

    expect(await signIn("bob@purdue.edu")).toBe(false);
  });

  it("rejects anyone not in the member table", async () => {
    vi.mocked(getMemberAccess).mockResolvedValue(access({ isMember: false }));

    expect(await signIn("stranger@purdue.edu")).toBe(false);
  });

  it("rejects when the access check throws", async () => {
    vi.mocked(getMemberAccess).mockRejectedValue(new Error("db down"));

    expect(await signIn("alice@purdue.edu")).toBe(false);
  });

  it("checks an empty email when the account has none", async () => {
    vi.mocked(getMemberAccess).mockResolvedValue(access({ isMember: false }));

    expect(await signIn(null)).toBe(false);
    expect(getMemberAccess).toHaveBeenCalledWith("");
  });
});
