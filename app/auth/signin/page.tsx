"use client";

/**
 * API Endpoint which uses next-auth along with the Microsoft Azure authentication API to redirect users to sign in.
 *
 * @author Colin Hermack
 */

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@heroui/react";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  useEffect(() => {
    signIn("azure-ad", { callbackUrl });
  }, [callbackUrl]);

  return (
    <div className="flex justify-center items-center">
      <Spinner />
    </div>
  );
}
