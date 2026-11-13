/**
 * Validation for the dashboard's car and emergency contact forms. Shared by the client, which shows the errors inline,
 * and the API routes, which reject the same input with a 400.
 *
 * @author Colin Hermack
 */

export type CarInput = {
  nickname: string;
  model: string;
  seats: number;
  hitch: boolean;
};

export type EmergencyContactInput = {
  name: string;
  relation: string;
  phone: string;
  email: string;
};

export type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Partial<Record<keyof T, string>> };

const MAX_TEXT = 100;
const MAX_EMAIL = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates a car form or request body. Seats count the driver, so 2 to 15.
 *
 * @param body The untrusted input.
 * @returns The cleaned car, or an error message per invalid field.
 */
export function parseCar(body: unknown): Parsed<CarInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const nickname = text(b.nickname);
  const model = text(b.model);
  const seats = Number(b.seats);
  const errors: Partial<Record<keyof CarInput, string>> = {};

  if (nickname.length > MAX_TEXT)
    errors.nickname = "Keep this under 100 characters.";
  if (model.length > MAX_TEXT) errors.model = "Keep this under 100 characters.";
  if (!Number.isInteger(seats) || seats < 2 || seats > 15) {
    errors.seats = "Enter a number from 2 to 15.";
  }
  if (b.hitch !== undefined && typeof b.hitch !== "boolean") {
    errors.hitch = "Choose yes or no.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: { nickname, model, seats, hitch: b.hitch === true },
  };
}

/**
 * Validates an emergency contact form or request body. The phone is stored as digits only.
 *
 * @param body The untrusted input.
 * @returns The cleaned contact, or an error message per invalid field.
 */
export function parseEmergencyContact(
  body: unknown,
): Parsed<EmergencyContactInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = text(b.name);
  const relation = text(b.relation);
  const phone = text(b.phone).replace(/\D/g, "");
  const email = text(b.email);
  const errors: Partial<Record<keyof EmergencyContactInput, string>> = {};

  if (!name) errors.name = "Enter a name.";
  else if (name.length > MAX_TEXT)
    errors.name = "Keep this under 100 characters.";
  if (relation.length > MAX_TEXT)
    errors.relation = "Keep this under 100 characters.";
  if (phone.length !== 10) errors.phone = "Enter a 10-digit phone number.";
  if (email && (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email))) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return { ok: true, value: { name, relation, phone, email } };
}

/**
 * Formats a 10-digit phone as (765) 555-0142. Anything else, such as older dashed values, is returned unchanged.
 */
export function formatPhone(phone: string | undefined): string {
  const digits = phone ?? "";

  return /^\d{10}$/.test(digits)
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : digits;
}
