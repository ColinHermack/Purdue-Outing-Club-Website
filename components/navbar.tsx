/**
 * The navbar component which will be reused on every page.
 *
 * HeroUI v3 removed the dedicated Navbar component, so this is a hand-built responsive
 * navbar using plain markup + Tailwind. The mobile menu is toggled with local state.
 *
 * @author Colin Hermack
 */

"use client";

import { Link, buttonVariants } from "@heroui/react";
import NextLink from "next/link";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

import { ThemeSwitch } from "./theme-switch";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/logos";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/70 backdrop-blur-lg p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NextLink className="flex justify-start items-center gap-1" href="/">
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

        <div className="hidden lg:flex justify-center items-center gap-4">
          <ThemeSwitch className="mr-10" />
          <Link className={buttonVariants()} href="/join">
            Join
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-4 pl-4">
          <ThemeSwitch className="mr-10" />
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="text-2xl"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="lg:hidden mt-5 flex flex-col gap-2">
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
          <Link
            key="join"
            className="text-amber-400 font-semibold text-2xl m-2"
            href="/join"
            onPress={() => setIsMenuOpen(false)}
          >
            Join
          </Link>
        </div>
      ) : null}
    </nav>
  );
};
