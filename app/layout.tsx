/**
 * Root layout wrapped around every page. Order matters: AuthProvider (NextAuth session for useSession) wraps Providers
 * (HeroUI and next-themes), which wrap the navbar, page content and footer. Vercel Analytics and Speed Insights are
 * mounted here and report to the Vercel project dashboard.
 *
 * @author Colin Hermack
 */

import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "./providers";

import { AuthProvider } from "@/components/AuthProvider";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/** Default <title> and description. Pages set their own title, shown as "<page> - Purdue Outing Club". */
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <AuthProvider>
          <Providers
            // Always follow the system light/dark setting. The site once had a theme toggle that saved "theme" in
            // localStorage; this new key ignores those old saved choices, and nothing writes to it.
            themeProps={{
              attribute: "class",
              defaultTheme: "system",
              enableSystem: true,
              storageKey: "theme-system",
            }}
          >
            <div className="relative flex flex-col h-screen">
              <Navbar />
              <main className="container mx-auto max-w-7xl pt-8 px-6 flex-grow">
                {children}
              </main>
              <Footer />
              <Analytics />
              <SpeedInsights />
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
