import React from "react";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 md:py-10">
      <div className="inline-block max-w-2xl text-center items-center justify-center">
        {children}
      </div>
    </section>
  );
}
