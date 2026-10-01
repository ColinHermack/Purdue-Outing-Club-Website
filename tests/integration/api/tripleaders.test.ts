import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetDb } from "../db";

import { GET, POST, PUT } from "@/app/api/protected/tripleaders/route";

vi.mock("next-auth/next");

const signInAs = (email: string) =>
  vi
    .mocked(getServerSession)
    .mockResolvedValue({ user: { email }, expires: "2099-01-01" });

const request = (method: string, body: object) =>
  new NextRequest("http://localhost/api/protected/tripleaders", {
    method,
    body: JSON.stringify(body),
  });

describe("/api/protected/tripleaders against the test DB", () => {
  beforeEach(async () => {
    await resetDb();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("an authorized officer (Webmaster) can list, create and update trip leaders", async () => {
    signInAs("alice@purdue.edu");

    const list = await GET();

    expect(list.status).toBe(200);
    expect((await list.json()).map((l: { gmail: string }) => l.gmail)).toEqual([
      "alice@gmail.com",
      "carol@gmail.com",
    ]);

    const created = await POST(
      request("POST", {
        memberId: 5,
        sport: ["Hiking"],
        process: { shadow: false },
        gmail: "e@g.com",
      }),
    );

    expect(created.status).toBe(200);
    expect(await created.json()).toMatchObject({
      member: { id: 5 },
      sport: ["Hiking"],
    });

    const updated = await PUT(
      request("PUT", {
        memberId: 5,
        sport: ["Hiking", "Fishing"],
        process: { shadow: true, approved: true, certified: false },
        gmail: "e@g.com",
      }),
    );

    expect(updated.status).toBe(200);
    expect(await updated.json()).toMatchObject({
      sport: ["Hiking", "Fishing"],
      process: { shadow: true, approved: true, certified: false },
    });
  });

  it("an officer without an authorized position gets 401", async () => {
    signInAs("bob@purdue.edu");

    expect((await GET()).status).toBe(401);
  });

  it("a member who is not an officer gets 401", async () => {
    signInAs("carol@purdue.edu");

    expect((await GET()).status).toBe(401);
  });

  it.each(["POST", "PUT"])(
    "%s for an unknown member gets 404",
    async (method) => {
      signInAs("dave@purdue.edu");

      const handler = method === "POST" ? POST : PUT;

      expect(
        (await handler(request(method, { memberId: 999, sport: [] }))).status,
      ).toBe(404);
    },
  );

  it("POST for a member who is already a trip leader gets 500", async () => {
    signInAs("alice@purdue.edu");

    expect(
      (await POST(request("POST", { memberId: 3, sport: ["Climbing"] })))
        .status,
    ).toBe(500);
  });
});
