import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { pdfWithText } from "../../../helpers";

import { POST } from "@/app/api/automation/dues/route";
import { recordDuesByEmail } from "@/miniservices/memberMiniService";

vi.mock("@/miniservices/memberMiniService");

const KEY = "k".repeat(48);

function base64Pdf(...lines: string[]) {
  return Buffer.from(pdfWithText(...lines)).toString("base64");
}

function request(
  body: unknown,
  headers: Record<string, string> = { authorization: `Bearer ${KEY}` },
) {
  return new NextRequest("http://localhost/api/automation/dues", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// Order number, order date, customer ID and name, as TooCool lays them out.
const annual = () => ({
  email: "alice@purdue.edu",
  receipt: base64Pdf(
    "123456",
    "23 Sep 2026",
    "aanderson",
    "Alice Anderson",
    "1 Club Dues- Annual 45.00",
  ),
});

describe("POST /api/automation/dues", () => {
  beforeEach(() => {
    vi.stubEnv("DUES_API_KEY", KEY);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-23T12:00:00Z"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe("auth", () => {
    it.each([
      ["no header", {}],
      ["wrong key", { authorization: `Bearer ${"x".repeat(48)}` }],
      ["key without Bearer", { authorization: KEY }],
      [
        "a NextAuth session cookie but no key",
        { cookie: "next-auth.session-token=abc" },
      ],
    ])("returns 401 for %s", async (_, headers) => {
      expect((await POST(request(annual(), headers))).status).toBe(401);
      expect(recordDuesByEmail).not.toHaveBeenCalled();
    });

    it.each([
      ["unset", ""],
      ["too short", "short"],
    ])("fails closed when DUES_API_KEY is %s", async (_, key) => {
      vi.stubEnv("DUES_API_KEY", key);

      const res = await POST(
        request(annual(), { authorization: `Bearer ${key}` }),
      );

      expect(res.status).toBe(401);
    });
  });

  describe("validation", () => {
    it.each([
      ["bad JSON", "{not json"],
      ["missing email", { receipt: base64Pdf("Club Dues- Annual") }],
      ["blank email", { email: " ", receipt: base64Pdf("Club Dues- Annual") }],
      ["missing receipt", { email: "alice@purdue.edu" }],
      [
        "non-PDF receipt",
        {
          email: "alice@purdue.edu",
          receipt: Buffer.from("hello").toString("base64"),
        },
      ],
      [
        "unreadable PDF",
        {
          email: "alice@purdue.edu",
          receipt: Buffer.from("%PDF-junk").toString("base64"),
        },
      ],
    ])("returns 400 for %s", async (_, body) => {
      expect((await POST(request(body))).status).toBe(400);
      expect(recordDuesByEmail).not.toHaveBeenCalled();
    });

    it("returns 422 for a receipt that is not for dues", async () => {
      const res = await POST(
        request({
          email: "alice@purdue.edu",
          receipt: base64Pdf("1 POC T-Shirt 15.00"),
        }),
      );

      expect(res.status).toBe(422);
      expect(recordDuesByEmail).not.toHaveBeenCalled();
    });
  });

  it("records annual dues for an existing member", async () => {
    vi.mocked(recordDuesByEmail).mockResolvedValue({
      expires: "2027-08-31",
      created: false,
    });

    const res = await POST(request(annual()));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      email: "alice@purdue.edu",
      type: "annual",
      expires: "2027-08-31",
      created: false,
    });
    expect(recordDuesByEmail).toHaveBeenCalledWith(
      "alice@purdue.edu",
      "Alice Anderson",
      "Annual",
      "2027-08-31",
    );
  });

  it("returns 201 when it creates a new member", async () => {
    vi.mocked(recordDuesByEmail).mockResolvedValue({
      expires: "2027-08-31",
      created: true,
    });

    const res = await POST(request(annual()));

    expect(res.status).toBe(201);
    expect((await res.json()).created).toBe(true);
  });

  it("records fall dues as Fall", async () => {
    vi.mocked(recordDuesByEmail).mockResolvedValue({
      expires: "2027-01-31",
      created: false,
    });

    const res = await POST(
      request({
        email: "bob@purdue.edu",
        receipt: base64Pdf("Club Dues- Fall Semester"),
      }),
    );

    expect(res.status).toBe(200);
    // No name on this receipt, so the email's local part stands in.
    expect(recordDuesByEmail).toHaveBeenCalledWith(
      "bob@purdue.edu",
      "bob",
      "Fall",
      "2027-01-31",
    );
  });

  it("records spring dues as Spring", async () => {
    vi.setSystemTime(new Date("2027-01-12T12:00:00Z"));
    vi.mocked(recordDuesByEmail).mockResolvedValue({
      expires: "2027-08-31",
      created: false,
    });

    const res = await POST(
      request({
        email: "bob@purdue.edu",
        receipt: base64Pdf("Club Dues- Spring Semester"),
      }),
    );

    expect(res.status).toBe(200);
    expect(recordDuesByEmail).toHaveBeenCalledWith(
      "bob@purdue.edu",
      "bob",
      "Spring",
      "2027-08-31",
    );
  });

  it("returns 500 when the database fails", async () => {
    vi.mocked(recordDuesByEmail).mockRejectedValue(new Error("db down"));

    expect((await POST(request(annual()))).status).toBe(500);
  });
});
