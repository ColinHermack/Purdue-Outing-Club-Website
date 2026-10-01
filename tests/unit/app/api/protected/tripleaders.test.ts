import { getServerSession } from "next-auth/next";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { badJsonRequest, jsonRequest, session } from "../../../helpers";

import { GET, POST, PUT } from "@/app/api/protected/tripleaders/route";
import { getMemberById } from "@/miniservices/memberMiniService";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";
import {
  createTripLeader,
  getAllTripLeaders,
  getTripLeader,
  updateTripLeader,
} from "@/miniservices/tripLeaderMiniService";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/officerMiniService");
vi.mock("@/miniservices/tripLeaderMiniService");

const leader = {
  member: { id: 3, name: "Carol" },
  sport: ["Climbing"],
  leadCount: 0,
};
const body = { memberId: 3, sport: ["Climbing"], gmail: "carol@gmail.com" };

function signInAs(position: string) {
  vi.mocked(getServerSession).mockResolvedValue(session());
  vi.mocked(getOfficerDataByEmail).mockResolvedValue([{ position }]);
}

// All three handlers share the same session + officer-position gate.
describe.each([
  ["GET", () => GET()],
  ["POST", () => POST(jsonRequest(body))],
  ["PUT", () => PUT(jsonRequest(body, "PUT"))],
])("%s /api/protected/tripleaders authorization", (_, call) => {
  it("returns 403 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await call()).status).toBe(403);
  });

  it("returns 403 when the session has no email", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(null));

    expect((await call()).status).toBe(403);
  });

  it("returns 401 for a non-officer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getOfficerDataByEmail).mockResolvedValue(null);

    expect((await call()).status).toBe(401);
  });

  it("returns 401 for an officer without an authorized position", async () => {
    signInAs("Club Goober");

    expect((await call()).status).toBe(401);
  });

  it("returns 500 when a lookup throws", async () => {
    vi.mocked(getServerSession).mockRejectedValue(new Error("boom"));

    expect((await call()).status).toBe(500);
  });
});

describe("GET /api/protected/tripleaders", () => {
  it("returns every trip leader to an authorized officer", async () => {
    signInAs("Webmaster");
    vi.mocked(getAllTripLeaders).mockResolvedValue([leader]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([leader]);
  });
});

describe.each([
  ["POST", (req: NextRequest) => POST(req), createTripLeader],
  ["PUT", (req: NextRequest) => PUT(req), updateTripLeader],
])("%s /api/protected/tripleaders", (method, handler, write) => {
  beforeEach(() => {
    signInAs("President");
    vi.mocked(getMemberById).mockResolvedValue({ id: 3 });
    vi.mocked(write).mockResolvedValue(true);
    vi.mocked(getTripLeader).mockResolvedValue(leader);
  });

  it("writes the trip leader and returns it", async () => {
    const response = await handler(jsonRequest(body, method));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(leader);
    expect(write).toHaveBeenCalledWith(body);
    expect(getTripLeader).toHaveBeenCalledWith(3);
  });

  it("returns 400 for a body that is not JSON", async () => {
    expect((await handler(badJsonRequest(method))).status).toBe(400);
    expect(write).not.toHaveBeenCalled();
  });

  it("returns 400 when memberId is missing", async () => {
    expect((await handler(jsonRequest({ sport: [] }, method))).status).toBe(
      400,
    );
    expect(write).not.toHaveBeenCalled();
  });

  it("returns 404 when the member does not exist", async () => {
    vi.mocked(getMemberById).mockResolvedValue(null);

    expect((await handler(jsonRequest(body, method))).status).toBe(404);
    expect(write).not.toHaveBeenCalled();
  });

  it("returns 500 when the write fails", async () => {
    vi.mocked(write).mockResolvedValue(false);

    expect((await handler(jsonRequest(body, method))).status).toBe(500);
  });

  it("returns 500 when the written row cannot be read back", async () => {
    vi.mocked(getTripLeader).mockResolvedValue(null);

    expect((await handler(jsonRequest(body, method))).status).toBe(500);
  });
});
