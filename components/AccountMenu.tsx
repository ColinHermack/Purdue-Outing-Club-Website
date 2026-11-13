"use client";

/**
 * Desktop account menu for the navbar: an avatar button that opens the member's name, dashboard link, club tools and
 * sign out.
 *
 * @author Colin Hermack
 */

import { Dropdown, Header, Label, Separator } from "@heroui/react";
import { useRouter } from "next/navigation";

import type { Account } from "@/components/useAccount";
import { accountTools } from "@/config/site";
import { initials } from "@/utils/initials";

export function AccountMenu({ account }: { account: Account }) {
  const router = useRouter();
  const firstName = account.name.split(" ")[0];

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`Account menu for ${account.name}`}
        className="h-11 pl-1 pr-3 rounded-full border border-border bg-surface flex items-center gap-2"
      >
        <span
          aria-hidden="true"
          className="size-[34px] rounded-full bg-amber-400 text-black text-[13px] font-bold flex items-center justify-center"
        >
          {initials(account.name)}
        </span>
        <span className="text-sm font-medium">{firstName}</span>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <div className="px-3 pt-3 pb-1 flex flex-col">
          <span className="text-sm font-semibold">{account.name}</span>
          <span className="text-xs text-muted">{account.email}</span>
        </div>
        <Dropdown.Menu onAction={(key) => router.push(String(key))}>
          <Dropdown.Item id="/dashboard" textValue="My Dashboard">
            <Label>My Dashboard</Label>
          </Dropdown.Item>
          {account.tools.length > 0 ? (
            <Dropdown.Section>
              <Header className="px-3 pt-2 text-xs font-semibold text-muted">
                Club tools
              </Header>
              {account.tools.map((id) => (
                <Dropdown.Item
                  key={id}
                  id={accountTools[id].href}
                  textValue={accountTools[id].label}
                >
                  <Label>{accountTools[id].label}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
          ) : null}
          <Separator />
          <Dropdown.Item id="/auth/signout" textValue="Sign out">
            <Label>Sign out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
