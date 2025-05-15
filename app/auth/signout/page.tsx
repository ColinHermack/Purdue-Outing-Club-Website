"use client";

/**
 * API Endpoint which uses next-auth along with the Microsoft Azure authentication API to redirect users to sign out.
 *
 * @author Colin Hermack
 */

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { Spinner } from "@heroui/spinner";

export default function SignIn() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex justify-center items-center">
      <Spinner color={"default"} />
    </div>
  );
}
