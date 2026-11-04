import { describe, expect, it, vi } from "vitest";

import { getMemberByEmail } from "@/miniservices/memberMiniService";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";
import { getTripLeader } from "@/miniservices/tripLeaderMiniService";
import { canSignIn, getMemberAccess } from "@/utils/memberAccess";

vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/officerMiniService");
vi.mock("@/miniservices/tripLeaderMiniService");

function setup(opts: {
  member?: boolean;
  positions?: string[];
  leader?: boolean;
}) {
  vi.mocked(getMemberByEmail).mockResolvedValue(
    opts.member === false ? null : { id: 1, name: "Alice" },
  );
  vi.mocked(getOfficerDataByEmail).mockResolvedValue(
    opts.positions ? opts.positions.map((position) => ({ position })) : null,
  );
  vi.mocked(getTripLeader).mockResolvedValue(opts.leader ? {} : null);
}

describe("getMemberAccess", () => {
  it("gives a stranger nothing", async () => {
    setup({ member: false });
    const access = await getMemberAccess("x@purdue.edu");

    expect(access.isMember).toBe(false);
    expect(canSignIn(access)).toBe(false);
  });

  it("gives a plain member no sign-in", async () => {
    setup({});
    const access = await getMemberAccess("x@purdue.edu");

    expect(canSignIn(access)).toBe(false);
    expect(access.tools).toEqual([]);
  });

  it("gives a trip leader the directory only", async () => {
    setup({ leader: true });
    const access = await getMemberAccess("x@purdue.edu");

    expect(canSignIn(access)).toBe(true);
    expect(access.tools).toEqual(["memberDirectory"]);
  });

  it("gives the webmaster every tool", async () => {
    setup({ positions: ["Webmaster"], leader: true });

    expect((await getMemberAccess("x@purdue.edu")).tools).toEqual([
      "tripLeaderDashboard",
      "memberDirectory",
      "memberExport",
    ]);
  });

  it("lets any officer in, but only listed positions get tools", async () => {
    setup({ positions: ["Treasurer"] });
    const access = await getMemberAccess("x@purdue.edu");

    expect(canSignIn(access)).toBe(true);
    expect(access.tools).toEqual([]);
  });
});
