/**
 * Footer component which will be reused on every page.
 *
 * @author Colin Hermack
 */

import { Link, buttonVariants } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaSlack,
  FaLinkedin,
  FaLink,
} from "react-icons/fa";

import { Logo } from "@/components/logos";
import { siteConfig } from "@/config/site";

const socialMediaIcons = [
  <FaInstagram key={0} />,
  <FaYoutube key={1} />,
  <FaFacebook key={2} />,
  <FaSlack key={3} />,
  <FaLinkedin key={4} />,
  <FaLink key={5} />,
];

export const Footer = () => {
  return (
    <footer className="w-screen flex flex-col justify-top items-center mt-10">
      <div className="flex flex-col lg:flex-row">
        {siteConfig.footerItems.map((item) => (
          <NextLink
            key={item.href}
            className={clsx(
              "text-foreground hover:opacity-80",
              "data-[active=true]:text-primary data-[active=true]:font-medium m-4 justify-center items-center",
            )}
            color="foreground"
            href={item.href}
          >
            {item.label}
          </NextLink>
        ))}
      </div>

      <Link
        className={buttonVariants({ className: "my-8" })}
        href="/safetyconcernreport"
      >
        Report a Safety Concern
      </Link>
      <div className="flex flex-row text-2xl">
        {siteConfig.links.map((item, index) => (
          <NextLink
            key={item.href}
            className="text-foreground text-2xl m-4 hover:text-gray-400"
            href={item.href}
          >
            {socialMediaIcons[index]}
          </NextLink>
        ))}
      </div>
      <div className="flex flex-col md:flex-row justify-center md:justify-evenly items-center md:items-start w-screen m-auto my-10">
        {siteConfig.sitemapLinks.map((section) => (
          <div
            key={section.category}
            className="flex flex-col items-center m-3 md:items-start gap-1"
          >
            <p className="text-start text-lg font-semibold">
              {section.category}
            </p>
            {section.links.map((link) => (
              <NextLink
                key={link.href}
                className={clsx(
                  "text-foreground hover:opacity-80",
                  "data-[active=true]:text-primary data-[active=true]:font-medium flex md:justify-start items-center",
                )}
                color="foreground"
                href={link.href}
              >
                {link.label}
              </NextLink>
            ))}
          </div>
        ))}
      </div>
      <div className="m-4">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="mt-4 mb-8 text-xs">© 2024 Purdue Outing Club</div>
    </footer>
  );
};
