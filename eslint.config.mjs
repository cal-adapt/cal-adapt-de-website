import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  // Override default ignores from eslint-config-next.
  globalIgnores([
    // Default ignores from eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // TEMP: Override rules from eslint-config-next (temporary)
      "react-hooks/immutability": "warn",
      // Import rules
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React and Next
            ["^react$", "^next", "^@next"],
            // MUI
            ["^@mui"],
            // Scoped packages
            ["^@"],
            // Other packages
            ["^[a-z]"],
            // Aliases (e.g., @/components)
            ["^@/"],
            // Parent folder imports
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Same-folder imports
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Styles
            ["^.+\\.s?css$"],
            // Side effects
            ["^\\u0000"],
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
