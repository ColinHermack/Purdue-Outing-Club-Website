import { getServerSession } from "next-auth/next";
import { describe, expect, it, vi } from "vitest";

import { badJsonRequest, jsonRequest, session } from "../../../helpers";

import {
  DELETE as deleteCar,
  PUT as putCar,
} from "@/app/api/protected/user/car/route";
import { PUT as putContact } from "@/app/api/protected/user/emergencycontact/route";
import {
  removeCarByEmail,
  updateCarByEmail,
  updateEmergencyContactByEmail,
} from "@/miniservices/memberMiniService";
import { getMemberAccess } from "@/utils/memberAccess";

vi.mock("next-auth/next");
vi.mock("@/miniservices/memberMiniService");
vi.mock("@/utils/memberAccess", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/memberAccess")>()),
  getMemberAccess: vi.fn(),
}));

const allowed = {
  isMember: true,
  isOfficer: false,
  isTripLeader: true,
  name: "Alice",
  tools: [],
};

const car = { nickname: "Gold Rush", model: "Outback", seats: 5, hitch: true };
const contact = {
  name: "Jordan",
  relation: "Parent",
  phone: "(765) 555-0142",
  email: "",
};

function signedIn() {
  vi.mocked(getServerSession).mockResolvedValue(session());
  vi.mocked(getMemberAccess).mockResolvedValue(allowed);
}

describe.each([
  ["PUT /user/car", () => putCar(jsonRequest(car, "PUT"))],
  ["DELETE /user/car", () => deleteCar()],
  ["PUT /user/emergencycontact", () => putContact(jsonRequest(contact, "PUT"))],
])("%s", (_, call) => {
  it("returns 401 with no session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    expect((await call()).status).toBe(401);
  });

  it("returns 403 for a member who is neither officer nor trip leader", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberAccess).mockResolvedValue({
      ...allowed,
      isTripLeader: false,
    });

    expect((await call()).status).toBe(403);
  });

  it("returns 404 when the email is not a member", async () => {
    signedIn();
    vi.mocked(updateCarByEmail).mockResolvedValue(null);
    vi.mocked(removeCarByEmail).mockResolvedValue(false);
    vi.mocked(updateEmergencyContactByEmail).mockResolvedValue(null);

    expect((await call()).status).toBe(404);
  });

  it("returns 500 when a lookup throws", async () => {
    vi.mocked(getServerSession).mockResolvedValue(session());
    vi.mocked(getMemberAccess).mockRejectedValue(new Error("boom"));

    expect((await call()).status).toBe(500);
  });
});

describe.each([
  ["PUT /user/car", putCar, { ...car, seats: 1 }],
  ["PUT /user/emergencycontact", putContact, { ...contact, phone: "1" }],
])("%s validation", (_, PUT, invalid) => {
  it("returns 400 for a body that is not JSON", async () => {
    signedIn();

    expect((await PUT(badJsonRequest("PUT"))).status).toBe(400);
  });

  it("returns 400 with the field error for an invalid body", async () => {
    signedIn();

    const response = await PUT(jsonRequest(invalid, "PUT"));

    expect(response.status).toBe(400);
    expect(await response.text()).toMatch(/^Enter a/);
    expect(updateCarByEmail).not.toHaveBeenCalled();
    expect(updateEmergencyContactByEmail).not.toHaveBeenCalled();
  });
});

describe("successful writes", () => {
  it("PUT /user/car saves the parsed car for the session email", async () => {
    signedIn();
    vi.mocked(updateCarByEmail).mockResolvedValue({ model: "Outback" });

    const response = await putCar(
      jsonRequest({ ...car, seats: "5", nickname: " Gold Rush " }, "PUT"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ model: "Outback" });
    expect(updateCarByEmail).toHaveBeenCalledWith("alice@purdue.edu", car);
  });

  it("DELETE /user/car returns 204", async () => {
    signedIn();
    vi.mocked(removeCarByEmail).mockResolvedValue(true);

    expect((await deleteCar()).status).toBe(204);
    expect(removeCarByEmail).toHaveBeenCalledWith("alice@purdue.edu");
  });

  it("PUT /user/emergencycontact saves digits-only phone", async () => {
    signedIn();
    vi.mocked(updateEmergencyContactByEmail).mockResolvedValue({
      name: "Jordan",
    });

    const response = await putContact(jsonRequest(contact, "PUT"));

    expect(response.status).toBe(200);
    expect(updateEmergencyContactByEmail).toHaveBeenCalledWith(
      "alice@purdue.edu",
      { ...contact, phone: "7655550142" },
    );
  });
});
