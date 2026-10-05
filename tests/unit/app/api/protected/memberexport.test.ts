import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { session } from "../../../helpers";

import { GET } from "@/app/api/protected/memberexport/route";
import { getMembers } from "@/miniservices/memberMiniService";
import { getOfficerDataByEmail } from "@/miniservices/officerMiniService";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/miniservices/officerMiniService");

function signInAs(position: string) {
  vi.mocked(getServerSession).mockResolvedValue(session());
  vi.mocked(getOfficerDataByEmail).mockResolvedValue([{ position }]);
}

describe("GET /api/protected/memberexport", () => {
  it("returns 403 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await GET()).status).toBe(403);
  });

  it("returns 403 when the session has no email", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(null));

    expect((await GET()).status).toBe(403);
  });

  it("returns 401 for a non-officer", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getOfficerDataByEmail).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });

  it("returns 401 for an officer without an authorized position", async () => {
    signInAs("President");

    expect((await GET()).status).toBe(401);
  });

  it.each(["Gear Lord", "Secretary of Operations", "Webmaster"])(
    "returns a CSV attachment to the %s",
    async (position) => {
      signInAs(position);
      vi.mocked(getMembers).mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe(
        "text/csv; charset=utf-8",
      );
      expect(response.headers.get("Content-Disposition")).toMatch(
        /^attachment; filename="members-\d{4}-\d{2}-\d{2}\.csv"$/,
      );
    },
  );

  it("lists members sorted by name with cells escaped", async () => {
    signInAs("Gear Lord");
    vi.mocked(getMembers).mockResolvedValue([
      { name: "Zed", email: "zed@purdue.edu" },
      { name: 'Bob "Bobby", Jr.', email: "bob@purdue.edu" },
      { name: "=HYPERLINK()", email: "evil@purdue.edu" },
      { name: "Alice", email: undefined },
    ]);

    const response = await GET();

    expect(await response.text()).toBe(
      [
        "Name,Email",
        `"'=HYPERLINK()","evil@purdue.edu"`,
        `"Alice",""`,
        `"Bob ""Bobby"", Jr.","bob@purdue.edu"`,
        `"Zed","zed@purdue.edu"`,
        "",
      ].join("\r\n"),
    );
  });

  it("returns 500 when a lookup throws", async () => {
    signInAs("Webmaster");
    vi.mocked(getMembers).mockRejectedValue(new Error("boom"));

    expect((await GET()).status).toBe(500);
  });
});
