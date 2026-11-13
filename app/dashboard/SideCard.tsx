/**
 * The small cards in the dashboard's side column, and the status badge some of them show.
 *
 * @author Colin Hermack
 */

import { Card } from "@heroui/react";

export type Tone = "ok" | "bad" | "neutral";

export const TONE_CLASSES: Record<Tone, string> = {
  ok: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  bad: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  neutral: "bg-default text-muted",
};

export function Badge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`h-[26px] px-2.5 rounded-full text-xs font-semibold inline-flex items-center ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * @param aside Shown at the right of the title, such as a badge or an Edit button.
 */
export function SideCard({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full">
      <Card.Content className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-lg font-bold">{title}</h2>
          {aside}
        </div>
        {children}
      </Card.Content>
    </Card>
  );
}
