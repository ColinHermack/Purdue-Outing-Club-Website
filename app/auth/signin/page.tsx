"use client";

/**
 * Sign-in page. Sends the user straight to Microsoft, unless NextAuth sent them back here with an error, in which case
 * it explains what went wrong and waits for the user instead of retrying automatically.
 *
 * @author Colin Hermack
 */

import { Button, Link, Spinner } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useEffect } from "react";

import PageMessage from "@/components/PageMessage";

/**
 * Explains a NextAuth error code. AccessDenied comes from the signIn callback rejecting an email that is not in the
 * member table.
 *
 * @param error The NextAuth error code from the query string.
 * @returns The message to show.
 */
function errorMessage(error: string): React.ReactNode {
  if (error === "AccessDenied") {
    return (
      <>
        <p>
          The Microsoft account you signed in with isn&#39;t on the club&#39;s
          member list. Make sure you sign in with the Purdue account you used to
          join.
        </p>
        <p className="mt-4">
          Not a member yet? See <Link href="/join">how to join</Link>. If you
          think this is a mistake, contact the webmaster.
        </p>
      </>
    );
  }

  if (error === "Configuration") {
    return (
      <p>Sign-in is misconfigured on our end. Please contact the webmaster.</p>
    );
  }

  return (
    <p>
      Something went wrong while signing in with Microsoft. Please try again. If
      it keeps happening, contact the webmaster.
    </p>
  );
}

function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) signIn("azure-ad", { callbackUrl });
  }, [callbackUrl, error]);

  if (error) {
    return (
      <PageMessage
        action={
          // select_account lets someone who picked the wrong Microsoft account choose another one.
          <Button
            onPress={() =>
              signIn("azure-ad", { callbackUrl }, { prompt: "select_account" })
            }
          >
            Try Again
          </Button>
        }
        title="Couldn't Sign In"
      >
        {errorMessage(error)}
      </PageMessage>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <Spinner />
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      }
    >
      <SignInInner />
    </Suspense>
  );
}
