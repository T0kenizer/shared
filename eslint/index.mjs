import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import consistentTypeImports from './consistent-type-imports.mjs';

const plugin = {
  meta: { name: '@tokenizer/shared/eslint' },
  rules: { 'consistent-type-imports': consistentTypeImports },
  configs: {},
};

/**
 * The base every repo extends: eslint and typescript-eslint recommended rules
 * with type information, and type-only imports (`import type` when every
 * specifier is a type, inline `type` when mixed, never on enums).
 *
 * The consumer sets `parserOptions.tsconfigRootDir`.
 */
plugin.configs.recommended = [
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    name: 'tokenizer/recommended',
    languageOptions: { parserOptions: { projectService: true } },
    plugins: { tokenizer: plugin },
    rules: {
      'tokenizer/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
];

export default plugin;
