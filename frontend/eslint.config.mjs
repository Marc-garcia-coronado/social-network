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
    rules: {
      indent: ['error', 2],
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],

      // 🚫 Desactivar errores de optimización
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Agrega más reglas que quieras ignorar aquí
    }
  }
];

export default eslintConfig;
