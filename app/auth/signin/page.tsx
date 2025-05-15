"use client";

/**
 * API Endpoint which uses next-auth along with the Microsoft Azure authentication API to redirect users to sign in.
 *
 * @author Colin Hermack
 */

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { Spinner } from "@heroui/spinner";

export default function SignIn() {
  useEffect(() => {
    signIn("azure-ad", { callbackUrl: "/dashboard" });
  }, []);

  return (
    <div className="flex justify-center items-center">
      <Spinner color={"default"} />
    </div>
  );
}
