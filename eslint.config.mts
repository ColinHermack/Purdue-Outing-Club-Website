import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import { fixupPluginRules } from "@eslint/compat";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.tsbuildinfo",
      "public/**",
      ".vercel/**",
      "next.config.js",
      "postcss.config.js",
      "eslint.config.mts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    // eslint-plugin-react v7 types predate ESLint v9's Plugin interface
    plugins: { react: fixupPluginRules(pluginReact as any) },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
    languageOptions: {
      parserOptions: pluginReact.configs.recommended.parserOptions,
    },
  },
]);
