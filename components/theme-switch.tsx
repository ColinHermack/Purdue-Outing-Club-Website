/**
 * A component which is used to switch the theme of the website from light mode to dark mode or vice versa.
 *
 * HeroUI v3 removed the `useSwitch` hook, so this is rebuilt as an accessible icon toggle button
 * driven directly by `next-themes`.
 *
 * @author Colin Hermack
 */

"use client";

import { FC } from "react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { FaSun, FaMoon } from "react-icons/fa";

export interface ThemeSwitchProps {
  className?: string;
}

/**
 * ThemeSwitch toggles the website's theme between light and dark modes.
 * It uses the `useTheme` hook from `next-themes` to access and set the current theme.
 *
 * Props:
 * - className: Optional custom class names for styling the base component.
 *
 * Accessibility:
 * - Renders a real <button> with an `aria-label` describing the action.
 *
 * Note:
 * - Handles server-side rendering (SSR) by checking `useIsSSR()`.
 * - Conditionally renders icons based on the current theme or SSR state.
 */
export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const isLight = theme === "light" || isSSR;

  const onChange = () => {
    setTheme(isLight ? "dark" : "light");
  };

  return (
    <button
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className={clsx(
        "px-px transition-opacity hover:opacity-80 cursor-pointer text-default-500 flex items-center justify-center",
        className,
      )}
      type="button"
      onClick={onChange}
    >
      {isLight ? <FaSun /> : <FaMoon />}
    </button>
  );
};
