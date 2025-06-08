import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import _import from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["dist/**/*"], "Ignore the build directory"),
  ...compat.extends("eslint:recommended"),
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
      },

      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  ...fixupConfigRules(
    compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
    ),
  ).map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  })),
  {
    files: ["**/*.{ts,tsx}"],

    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      parser: tsParser,
    },

    settings: {
      "import/internal-regex": "^@/",

      "import/resolver": {
        node: {
          extensions: [".ts", ".tsx"],
        },

        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "no-empty-pattern": "off",
    },
  },
]);
