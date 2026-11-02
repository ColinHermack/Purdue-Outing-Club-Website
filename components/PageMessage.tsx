/**
 * A full-page message used when a page cannot show its content: sign-in errors, missing permissions, or failed loads.
 *
 * @author Colin Hermack
 */

import { Link, buttonVariants } from "@heroui/react";

export default function PageMessage({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-top items-center gap-6 px-6 md:py-10">
      <h1 className="text-5xl text-amber-400 font-bold text-center">{title}</h1>
      <div className="text-center max-w-[600px]">{children}</div>
      <div className="flex flex-row flex-wrap justify-center gap-4">
        {action}
        <Link className={buttonVariants({ variant: "secondary" })} href="/">
          Return Home
        </Link>
      </div>
    </div>
  );
}
