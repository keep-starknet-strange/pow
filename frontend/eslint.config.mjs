// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  eslintPluginReactHooks.configs.recommended,
  {
    plugins: {
      "react-compiler": eslintPluginReactHooks,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": 0,
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/react-compiler": "error",
    },
    ignores: [".expo/**"],
  },
);
