import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      // Disable TypeScript strict checks
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      
      // Disable React specific rules
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      
      // Disable Next.js specific rules
      '@next/next/no-page-custom-font': 'off',
      
      // Other common rules to disable during development
      'no-console': 'off',
    },
  }),
];

export default eslintConfig;
