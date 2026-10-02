import { describe, expect, it } from "vitest";

import { pdfWithText } from "../helpers";

import {
  classifyReceiptText,
  duesExpiration,
  readReceipt,
  receiptCustomerName,
} from "@/utils/duesReceipt";

// The line layout pdf.js extracts from a real TooCool receipt, with fake values.
const RECEIPT_LINES = [
  "Order",
  "Order:",
  "Order Date:",
  "Customer ID:",
  "Ship To:",
  "Total",
  "123456",
  "23 Sep 2026",
  "pdoe",
  "Pat O'Doe-Smith",
  "Pat O'Doe-Smith",
  "1 Main St",
  "1 Club Dues- Annual 45.00 0.00 0.00 45.00",
  "PAID 45.00",
];

describe("classifyReceiptText", () => {
  it.each([
    ["annual", "1  Club Dues- Annual  45.00", "annual"],
    ["fall", "1 Club Dues- Fall Semester 25.00", "fall"],
    ["spring", "1 Club Dues- Spring Semester 25.00", "spring"],
    ["spaced hyphen", "Club Dues - Annual", "annual"],
    ["any case", "CLUB DUES-ANNUAL", "annual"],
    ["split across lines", "Club\n  Dues-\n Fall   Semester", "fall"],
    [
      "annual wins over semester",
      "Club Dues- Spring Semester Club Dues- Annual",
      "annual",
    ],
    ["other item", "1 POC T-Shirt 15.00", "other"],
    ["empty", "", "other"],
  ])("%s", (_, text, expected) => {
    expect(classifyReceiptText(text)).toBe(expected);
  });
});

describe("receiptCustomerName", () => {
  it("reads the name after the order number, date and customer ID", () => {
    expect(receiptCustomerName(RECEIPT_LINES.join("\n"))).toBe(
      "Pat O'Doe-Smith",
    );
  });

  it.each([
    ["no header values", "1 Club Dues- Annual 45.00"],
    [
      "an address where the name should be",
      "123456\n23 Sep 2026\npdoe\n1 Main St\n",
    ],
    ["an over-long name", `123456\n23 Sep 2026\npdoe\n${"a".repeat(256)}\n`],
  ])("returns null for %s", (_, text) => {
    expect(receiptCustomerName(text)).toBeNull();
  });
});

describe("readReceipt", () => {
  it("reads the kind and name out of a real PDF", async () => {
    // The PDF's standard font encoding turns ' into ’, as real receipts may.
    expect(await readReceipt(pdfWithText(...RECEIPT_LINES))).toEqual({
      kind: "annual",
      name: "Pat O’Doe-Smith",
    });
    expect(await readReceipt(pdfWithText("1 POC Sticker 2.00"))).toEqual({
      kind: "other",
      name: null,
    });
  });

  it("throws on bytes that are not a PDF", async () => {
    await expect(
      readReceipt(new TextEncoder().encode("%PDF-garbage")),
    ).rejects.toThrow();
  });
});

describe("duesExpiration", () => {
  it.each([
    ["annual", "2026-09-23", "2027-08-31"],
    ["annual", "2026-08-30", "2026-08-31"],
    ["annual", "2026-08-31", "2027-08-31"],
    ["annual", "2026-09-01", "2027-08-31"],
    ["annual", "2027-01-15", "2027-08-31"],
    ["spring", "2027-01-10", "2027-08-31"],
    ["fall", "2026-08-25", "2027-01-31"],
    ["fall", "2027-01-30", "2027-01-31"],
    ["fall", "2027-01-31", "2028-01-31"],
    ["fall", "2027-02-01", "2028-01-31"],
  ] as const)("%s paid %s expires %s", (kind, paid, expected) => {
    expect(duesExpiration(kind, new Date(`${paid}T12:00:00Z`))).toBe(expected);
  });
});
