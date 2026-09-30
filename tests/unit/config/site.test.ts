import fs from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

// Every link in the site config that points inside this app, whether a page or a file in public/.
const internalHrefs = [
  ...siteConfig.navItems,
  ...siteConfig.footerItems,
  ...siteConfig.sitemapLinks.flatMap((category) => category.links),
]
  .map((item) => item.href)
  .filter((href) => href.startsWith("/"));

describe("siteConfig links", () => {
  it.each([...new Set(internalHrefs)])(
    "%s resolves to a page or a public file",
    (href) => {
      const isPage = fs.existsSync(
        path.join(process.cwd(), "app", href, "page.tsx"),
      );
      const isPublicFile = fs.existsSync(
        path.join(process.cwd(), "public", href),
      );

      expect(isPage || isPublicFile).toBe(true);
    },
  );
});
