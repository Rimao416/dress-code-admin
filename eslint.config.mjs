import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "src/generated/**/*",
      "**/generated/**/*",
      "**/*.generated.*",
      ".next/**/*",
      "node_modules/**/*"
    ]
  },
  {
    rules: {
      // Désactiver les erreurs "any"
      "@typescript-eslint/no-explicit-any": "off",
      
      // Désactiver les avertissements de variables non utilisées
      "@typescript-eslint/no-unused-vars": "off",
      
      // Désactiver prefer-const
      "prefer-const": "off",
      
      // Désactiver l'avertissement next/image
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;