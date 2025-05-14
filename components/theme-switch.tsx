/**
 * A component which is used to switch the theme of the website from light mode to dark mode or vice versa.
 *
 * @author Colin Hermack
 */

"use client";

import { FC } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { FaSun, FaMoon } from "react-icons/fa";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

/**
 * ThemeSwitch component toggles the website's theme between light and dark modes.
 * It uses the `useTheme` hook from `next-themes` to access and set the current theme,
 * and the `useSwitch` hook from `@heroui/switch` for switch functionality.
 * The component is accessible and visually hidden, using icons to indicate the
 * current theme state (sun icon for light mode, moon icon for dark mode).
 *
 * Props:
 * - className: Optional custom class names for styling the base component.
 * - classNames: Optional custom class names for different slots of the switch component.
 *
 * Accessibility:
 * - Uses `aria-label` to indicate the theme switch action.
 *
 * Note:
 * - Handles server-side rendering (SSR) by checking `useIsSSR()`.
 * - Conditionally renders icons based on the current theme or SSR state.
 */
export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "light" || isSSR,
    "aria-label": `Switch to ${theme === "light" || isSSR ? "dark" : "light"} mode`,
    onChange,
  });

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            [
              "w-auto h-auto",
              "bg-transparent",
              "rounded-lg",
              "flex items-center justify-center",
              "group-data-[selected=true]:bg-transparent",
              "!text-default-500",
              "pt-px",
              "px-0",
              "mx-0",
            ],
            classNames?.wrapper,
          ),
        })}
      >
        {!isSelected || isSSR ? <FaSun /> : <FaMoon />}
      </div>
    </Component>
  );
};
