/**
 * Sets the fonts for the site, which is referenced in the root layout component to set the font for the whole site.
 *
 * @author Colin Hermack
 */

import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
