import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { GET as getMemberDirectory } from "@/app/api/protected/memberdirectory/route";
import { GET as getMembers } from "@/app/api/protected/members/route";
import { GET as getUser } from "@/app/api/protected/user/route";
import { GET as getUserTrips } from "@/app/api/protected/user/trips/route";

vi.mock("next-auth/next");

const signInAs = (email: string) =>
  vi
    .mocked(getServerSession)
    .mockResolvedValue({ user: { email }, expires: "2099-01-01" });

describe("member routes against the test DB", () => {
  it("memberdirectory is open to trip leaders only", async () => {
    signInAs("carol@purdue.edu");

    const response = await getMemberDirectory();

    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(6);

    signInAs("frank@purdue.edu");
    expect((await getMemberDirectory()).status).toBe(401);

    signInAs("stranger@purdue.edu");
    expect((await getMemberDirectory()).status).toBe(404);
  });

  it("members is open to officers only and returns basic fields", async () => {
    signInAs("bob@purdue.edu");

    const response = await getMembers();
    const members = await response.json();

    expect(response.status).toBe(200);
    expect(members).toHaveLength(7);
    expect(Object.keys(members[0]).sort()).toEqual(["email", "id", "name"]);

    signInAs("carol@purdue.edu");
    expect((await getMembers()).status).toBe(401);
  });

  it("user returns the signed-in member", async () => {
    signInAs("erin@purdue.edu");

    const response = await getUser();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: 5,
      name: "Erin Evans",
      tripCount: 2,
    });

    signInAs("stranger@purdue.edu");
    expect((await getUser()).status).toBe(404);
  });

  it("user/trips returns the trips the signed-in member attended", async () => {
    signInAs("erin@purdue.edu");

    const response = await getUserTrips();

    expect(response.status).toBe(200);
    expect(
      (await response.json()).map((t: { name: string }) => t.name),
    ).toEqual(["Red River Gorge Climbing", "Smokies Backpacking"]);
  });
});
