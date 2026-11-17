/**
 * Makes the NextAuth session available to client components through useSession. Used once, in app/layout.tsx.
 *
 * @author Colin Hermack
 */

"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
