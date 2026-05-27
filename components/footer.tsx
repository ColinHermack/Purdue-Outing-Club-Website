/**
 * Footer component which will be reused on every page.
 *
 * @author Colin Hermack
 */

import { Button } from '@heroui/button';
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
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
              linkStyles({ color: "foreground" }),
              "data-[active=true]:text-primary data-[active=true]:font-medium m-4 justify-center items-center",
            )}
            color="foreground"
            href={item.href}
          >
            {item.label}
          </NextLink>
        ))}
      </div>

      <Button
        as={Link}
        className="bg-amber-400 text-black font-bold my-8"
        href="/safetyconcernreport"
        variant="flat"
      >
        Report a Safety Concern
      </Button>
      
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
      <div className="flex flex-col lg:flex-row justify-center lg:justify-evenly items-center lg:items-start w-screen m-auto my-10">
        <div className="flex flex-col">
          <p className="text-start text-lg font-semibold">About</p>
          {siteConfig.aboutItems.map((item) => (
            <NextLink
              key={item.href}
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium flex justify-start items-center",
              )}
              color="foreground"
              href={item.href}
            >
              {item.label}
            </NextLink>
          ))}
        </div>
        <div className="flex flex-col">
          <p className="text-start text-lg font-semibold">Trips</p>
          {siteConfig.tripsItems.map((item) => (
            <NextLink
              key={item.href}
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium justify-start items-center",
              )}
              color="foreground"
              href={item.href}
            >
              {item.label}
            </NextLink>
          ))}
        </div>
        <div className="flex flex-col">
          <p className="text-start text-lg font-semibold">Support</p>
          {siteConfig.supportItems.map((item) => (
            <NextLink
              key={item.href}
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium justify-start items-center",
              )}
              color="foreground"
              href={item.href}
            >
              {item.label}
            </NextLink>
          ))}
        </div>
        <div className="flex flex-col">
          <p className="text-start text-lg font-semibold">Other</p>
          {siteConfig.otherItems.map((item) => (
            <NextLink
              key={item.href}
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium justify-start items-center",
              )}
              color="foreground"
              href={item.href}
            >
              {item.label}
            </NextLink>
          ))}
        </div>
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
