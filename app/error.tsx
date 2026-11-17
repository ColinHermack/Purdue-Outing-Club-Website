/**
 * Next.js error boundary shown when a page throws while rendering. "Try again" re-renders the page.
 *
 * @author Colin Hermack
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Shows up in the browser console only. There is no error reporting service; server errors are in Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        className="bg-amber-400 text-black w-44 h-20 text-lg m-12 rounded-3xl font-bold"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
