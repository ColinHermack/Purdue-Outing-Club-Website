import { describe, expect, it } from "vitest";

import { initials } from "@/utils/initials";
import { buildPageItems } from "@/utils/pagination";
import {
  expiryStatus,
  formatTripDates,
  signupBlockers,
} from "@/utils/memberStatus";

const today = "2026-11-04";

describe("expiryStatus", () => {
  it.each([
    [{ Expires: "2027-01-01" }, "valid"],
    [{ Expires: "2026-11-04" }, "expired"],
    [{ Expires: "2025-01-01" }, "expired"],
    [{}, "none"],
    [null, "none"],
  ])("%j is %s", (data, expected) => {
    expect(expiryStatus(data, today)).toBe(expected);
  });
});

describe("signupBlockers", () => {
  const ok = {
    duesData: { Expires: "2027-01-01" },
    policyAgreement: true,
    waiverAgreement: true,
  };

  it("is empty for a ready member", () => {
    expect(signupBlockers(ok, today)).toEqual([]);
  });

  it("lists every missing item", () => {
    expect(
      signupBlockers(
        {
          duesData: { Expires: "2025-01-01" },
          policyAgreement: false,
          waiverAgreement: false,
        },
        today,
      ),
    ).toHaveLength(3);
  });
});

describe("formatTripDates", () => {
  it.each([
    ["2026-12-05T00:00:00Z", undefined, "Dec 5, 2026"],
    ["2026-11-14T00:00:00Z", "2026-11-16T00:00:00Z", "Nov 14 to 16, 2026"],
    ["2026-03-14T00:00:00Z", "2026-04-02T00:00:00Z", "Mar 14 to Apr 2, 2026"],
    ["2026-12-05T00:00:00Z", "2026-12-05T00:00:00Z", "Dec 5, 2026"],
  ])("%s to %s", (start, end, expected) => {
    expect(formatTripDates(start, end)).toBe(expected);
  });
});

describe("initials", () => {
  it.each([
    ["Sam Boiler", "SB"],
    ["sam", "S"],
    ["  Mary Ann Smith ", "MS"],
    ["", "?"],
  ])("%j is %s", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe("buildPageItems", () => {
  it("collapses gaps", () => {
    expect(buildPageItems(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
  });
});
