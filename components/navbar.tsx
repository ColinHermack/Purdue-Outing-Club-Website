/**
 * The navbar component which will be reused on every page.
 *
 * HeroUI v3 removed the dedicated Navbar component, so this is a hand-built responsive
 * navbar using plain markup + Tailwind. The mobile menu is toggled with local state.
 *
 * @author Colin Hermack
 */

"use client";

import { Link, Button } from "@heroui/react";
import { AnimatePresence, motion, Variants } from "motion/react";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";

import { ThemeSwitch } from "./theme-switch";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/logos";

/**
 * Reveal animation for the mobile menu. Replicates the HeroUI v2 NavbarMenu,
 * which animated its height from 0 to auto (with overflow clipped) so the menu
 * gradually unfolds from the top of the page.
 */
const menuVariants: Variants = {
  enter: {
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    height: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

/**
 * Menu-toggle icon animation. Both bars are drawn at the vertical center and
 * spread apart when closed (a two-bar "hamburger"); when open they collapse to
 * the center and rotate to form a crossed "x" (close) icon.
 */
const ICON_TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;

const topBarVariants: Variants = {
  closed: { rotate: 0, y: -4 },
  open: { rotate: 45, y: 0 },
};

const bottomBarVariants: Variants = {
  closed: { rotate: 0, y: 4 },
  open: { rotate: -45, y: 0 },
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/70 backdrop-blur-lg pt-4 p-2 flex flex-col justify-top items-left">
      <div className='w-full flex flex-row justify-apart items-center' >
        <div className="w-full flex items-center justify-between text-s">
          <div className="flex items-center gap-3">
            <NextLink className="flex justify-start items-center gap-1 ml-4" href="/">
              <Logo />
            </NextLink>
            <ul className="hidden lg:flex gap-4 justify-start ml-2">
              {siteConfig.navItems.map((item) => (
                <li key={item.href}>
                  <NextLink
                    className="text-foreground hover:opacity-80 transition-opacity data-[active=true]:text-primary data-[active=true]:font-medium"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:flex justify-right items-center mr-4">
            <ThemeSwitch className="mr-8" />
            <Button
              variant='primary'
              onClick={() => {redirect('/join')}}
              className='font-bold'
            >
              Join
            </Button>
          </div>

          <div className="lg:hidden flex flex-row gap-2">
            <ThemeSwitch className="mr-8" />
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <motion.svg
                animate={isMenuOpen ? "open" : "closed"}
                fill="none"
                height={28}
                initial={false}
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                width={28}
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.line
                  style={{ transformBox: "view-box", transformOrigin: "center" }}
                  transition={ICON_TRANSITION}
                  variants={topBarVariants}
                  x1="4"
                  x2="20"
                  y1="12"
                  y2="12"
                />
                <motion.line
                  style={{ transformBox: "view-box", transformOrigin: "center" }}
                  transition={ICON_TRANSITION}
                  variants={bottomBarVariants}
                  x1="4"
                  x2="20"
                  y1="12"
                  y2="12"
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            key="mobile-menu"
            animate="enter"
            className="lg:hidden overflow-hidden"
            exit="exit"
            initial="exit"
            variants={menuVariants}
          >
            <div className="mt-12 mb-24 flex flex-col gap-2">
              {siteConfig.navItems.map((item, index) => (
                <Link
                  key={`${item.href}-${index}`}
                  className="text-2xl font-semibold m-2 text-foreground"
                  href={item.href}
                  onPress={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                key="join"
                className="font-semibold text-2xl m-2"
                variant="primary"
                onPress={() => {
                  setIsMenuOpen(false);
                  redirect('/join');
                }}
              >
                Join
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};
