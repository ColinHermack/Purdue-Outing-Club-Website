/**
 * Serves the Scalar API reference for public/openapi.json. Public in every environment.
 *
 * @author Colin Hermack
 */

import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/openapi.json",
  pageTitle: "Purdue Outing Club API",
  // Pinned so a Scalar release can't change prod without a PR.
  cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.72.4",
});
