/**
 * A small wrapper around the HeroUI v3 Accordion composition (Item / Heading / Trigger /
 * Panel / Body). HeroUI v3 no longer ships the v2 `<AccordionItem title="..." />` shorthand, so
 * this keeps the per-item markup readable across the pages that use accordions.
 *
 * @author Colin Hermack
 */

import { Accordion } from "@heroui/react";
import type { ReactNode } from "react";

interface AccordionEntryProps {
  /** Unique id used by the Accordion for expanded-key tracking. */
  id: string;
  /** The heading shown in the trigger row. */
  title: ReactNode;
  /** The collapsible content. */
  children: ReactNode;
}

export function AccordionEntry({ id, title, children }: AccordionEntryProps) {
  return (
    <Accordion.Item id={id}>
      <Accordion.Heading>
        <Accordion.Trigger>
          {title}
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body>{children}</Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
