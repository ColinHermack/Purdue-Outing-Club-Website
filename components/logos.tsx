/**
 * Logos for use reuse across the site.
 *
 * @author Colin Hermack
 */

import * as React from "react";
import Image from "next/image";

export const Logo = (): JSX.Element => {
  return (
    <div className="bg-amber-400 w-12 h-12 flex justify-center items-center rounded-full mr-2">
      <Image alt="The POC logo" height={45} src="/poc_logo.png" width={45} />
    </div>
  );
};

export const LargeLogo = (): JSX.Element => {
  return (
    <div className="bg-amber-400 w-fit h-fit flex justify-center items-center rounded-full">
      <Image alt="The POC logo" height={250} src="/poc_logo.png" width={250} />
    </div>
  );
};
