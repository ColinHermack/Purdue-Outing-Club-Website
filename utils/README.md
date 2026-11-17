# `utils/`

Small helpers with no database access. Each has unit tests in `tests/unit/utils/`.

| File | Exports | Purpose |
| --- | --- | --- |
| `duesReceipt.ts` | `readReceipt`, `classifyReceiptText`, `receiptCustomerName`, `duesExpiration` | Reads TooCool receipt PDFs for `/api/automation/dues`: what kind of dues, the customer's name, and when the dues expire. Depends on TooCool's receipt wording and layout. |
| `protectedFetch.ts` | `protectedFetch`, `ProtectedResult` | Browser-side `fetch` for `/api/protected/*`. Sends the user to sign-in on `401`, returns `forbidden` on `403`. |
| `difficulty.ts` | `getTripDifficultyDescription` | Turns a sport and difficulty number into the description shown on a trip page. |
| `leadership.ts` | `Officer`, `BranchData`, `OfficerData` types | Shapes used by `/pleadership`. |
