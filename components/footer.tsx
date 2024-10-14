import { siteConfig } from "@/config/site";
import {Logo} from "@/components/icons";
import { Link } from "@nextui-org/link";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { FaInstagram, FaYoutube, FaFacebook, FaSlack, FaLinkedin, FaLink } from "react-icons/fa";

const socialMediaIcons = [<FaInstagram />, <FaYoutube />, <FaFacebook />, <FaSlack />, <FaLinkedin />, <FaLink />];

export const Footer = () => {
    return (
        <footer className="w-screen flex flex-col justify-top items-center mt-10">
              <div className='flex flex-col lg:flex-row'>
                {siteConfig.footerItems.map((item) => (
                    <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium m-4 justify-center items-center",
                    )}
                    color="foreground"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </NextLink>
                ))}
              </div>
              <div className='flex flex-row text-2xl'>
                {siteConfig.links.map((item, index) => (
                    <NextLink
                    className="text-foreground text-2xl m-4 hover:text-gray-400"
                    href={item.href}
                    key={item.href}
                  >{socialMediaIcons[index]}</NextLink>
                ))}
              </div>
              <div className='m-4'><Link href={siteConfig.navItems[0].href}><Logo/></Link></div>
              <div className='m-4'>© 2024 Colin Hermack, Purdue Outing Club</div>
        </footer>
    );
}