/**
 * Reads TooCool order receipts: classifies them as annual, fall or spring club dues, finds the
 * customer's name, and computes when the resulting dues expire.
 *
 * @author Colin Hermack
 */

import { extractText } from "unpdf";

export type ReceiptKind = "annual" | "fall" | "spring" | "other";

/**
 * Classifies the text of a receipt by its dues line item. Checked in the order annual, fall,
 * spring, so a receipt with several dues items reports the first match.
 *
 * @param text The text extracted from the receipt.
 * @returns The kind of dues the receipt is for, or "other".
 */
export function classifyReceiptText(text: string): ReceiptKind {
  const normalized = text.replace(/\s+/g, " ");

  if (/club dues\s*-\s*annual/i.test(normalized)) return "annual";
  if (/club dues\s*-\s*fall semester/i.test(normalized)) return "fall";
  if (/club dues\s*-\s*spring semester/i.test(normalized)) return "spring";

  return "other";
}

/**
 * Finds the customer's name on a receipt. TooCool prints the header values one per line after
 * their labels: order number, order date, customer ID, then the customer's name.
 *
 * @param text The text extracted from the receipt, line breaks intact.
 * @returns The customer's name, or null if it can't be found or doesn't look like a name.
 */
export function receiptCustomerName(text: string): string | null {
  const match = /^\d+\n\d{1,2} [A-Za-z]{3} \d{4}\n[^\n]+\n([^\n]+)$/m.exec(
    text,
  );
  const name = match?.[1].trim();

  return name && name.length <= 255 && /^[\p{L}\p{M} .'’-]+$/u.test(name)
    ? name
    : null;
}

/**
 * Extracts the text of a receipt PDF, classifies it and finds the customer's name. Throws if the
 * bytes are not a readable PDF.
 *
 * @param pdf The receipt PDF.
 * @returns The kind of dues the receipt is for (or "other") and the customer's name (or null).
 */
export async function readReceipt(
  pdf: Uint8Array,
): Promise<{ kind: ReceiptKind; name: string | null }> {
  const { text } = await extractText(pdf, { mergePages: true });

  return { kind: classifyReceiptText(text), name: receiptCustomerName(text) };
}

/**
 * Returns the date dues of the given kind expire when paid on `today`: the next Aug 31 for annual
 * and spring dues, the next Jan 31 for fall dues. Always strictly after `today`, because a member
 * is active only while Expires > CURRENT_DATE.
 *
 * ponytail: an annual payment made in July only lasts until that Aug 31. Switch to an
 * academic-year rule if members start renewing early.
 *
 * @param kind The kind of dues paid.
 * @param today The payment date (UTC). Defaults to now.
 * @returns The expiration date as YYYY-MM-DD.
 */
export function duesExpiration(
  kind: Exclude<ReceiptKind, "other">,
  today: Date = new Date(),
): string {
  const [month, day] = kind === "fall" ? [0, 31] : [7, 31];
  let year = today.getUTCFullYear();

  if (
    Date.UTC(year, month, day) <=
    Date.UTC(year, today.getUTCMonth(), today.getUTCDate())
  ) {
    year += 1;
  }

  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}
