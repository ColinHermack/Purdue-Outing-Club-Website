"use client";

/**
 * Loads the signed-in member's account menu data. Returns null while loading, when signed out, or when the member is
 * not allowed to sign in, so callers fall back to the signed-out view.
 *
 * @author Colin Hermack
 */

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import type { AccountToolId } from "@/config/site";
import { protectedFetch } from "@/utils/protectedFetch";

export type Account = { name: string; email: string; tools: AccountToolId[] };

export function useAccount(): Account | null {
  const { status } = useSession();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setAccount(null);

      return;
    }

    protectedFetch<Account>("/api/protected/user/access").then((result) => {
      setAccount(result.status === "ok" ? result.data : null);
    });
  }, [status]);

  return account;
}
