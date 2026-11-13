"use client";

/**
 * Footer link to sign in. Hidden while a session exists.
 *
 * @author Colin Hermack
 */

import { Link } from "@heroui/react";
import { useSession } from "next-auth/react";

export function SignInLink() {
  const { status } = useSession();

  if (status !== "unauthenticated") return null;

  return (
    <Link className="mr-4 mb-6" href="/auth/signin">
      Trip Leader Sign In
    </Link>
  );
}
