import { describe, expect, it } from "vitest";

import {
  formatPhone,
  parseCar,
  parseEmergencyContact,
} from "@/utils/memberForms";

describe("parseCar", () => {
  const car = { nickname: " Gold Rush ", model: "2019 Subaru Outback" };

  it("trims text, accepts string seats and defaults hitch to false", () => {
    expect(parseCar({ ...car, seats: "5" })).toEqual({
      ok: true,
      value: {
        nickname: "Gold Rush",
        model: "2019 Subaru Outback",
        seats: 5,
        hitch: false,
      },
    });
  });

  it("allows nickname and model to be empty", () => {
    expect(parseCar({ seats: 2, hitch: true })).toEqual({
      ok: true,
      value: { nickname: "", model: "", seats: 2, hitch: true },
    });
  });

  it.each([2, 15, "15"])("accepts %j seats", (seats) => {
    expect(parseCar({ seats }).ok).toBe(true);
  });

  it.each([undefined, "", 1, 16, 2.5, "abc", null])(
    "rejects %j seats",
    (seats) => {
      expect(parseCar({ ...car, seats })).toEqual({
        ok: false,
        errors: { seats: "Enter a number from 2 to 15." },
      });
    },
  );

  it("rejects overlong text and a non-boolean hitch", () => {
    const result = parseCar({ model: "x".repeat(101), seats: 5, hitch: "yes" });

    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual([
      "hitch",
      "model",
    ]);
  });

  it("treats a missing body as all fields missing", () => {
    expect(parseCar(null).ok).toBe(false);
  });
});

describe("parseEmergencyContact", () => {
  const contact = {
    name: "Jordan Boiler",
    relation: "Parent",
    phone: "765-555-0142",
    email: "",
  };

  it("strips the phone to digits and allows an empty email", () => {
    expect(parseEmergencyContact(contact)).toEqual({
      ok: true,
      value: { ...contact, phone: "7655550142" },
    });
  });

  it.each([
    [{ name: "  " }, { name: "Enter a name." }],
    [{ phone: "765555" }, { phone: "Enter a 10-digit phone number." }],
    [{ phone: "17655550142" }, { phone: "Enter a 10-digit phone number." }],
    [{ email: "pat@" }, { email: "Enter a valid email address." }],
    [
      { relation: "x".repeat(101) },
      { relation: "Keep this under 100 characters." },
    ],
  ])("rejects %j", (change, errors) => {
    expect(parseEmergencyContact({ ...contact, ...change })).toEqual({
      ok: false,
      errors,
    });
  });

  it("accepts a valid email", () => {
    expect(
      parseEmergencyContact({ ...contact, email: "pat@example.com" }).ok,
    ).toBe(true);
  });
});

describe("formatPhone", () => {
  it.each([
    ["7655550142", "(765) 555-0142"],
    ["765-555-0142", "765-555-0142"],
    ["", ""],
    [undefined, ""],
  ])("%j formats as %j", (phone, expected) => {
    expect(formatPhone(phone)).toBe(expected);
  });
});
