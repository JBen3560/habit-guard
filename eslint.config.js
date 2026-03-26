// eslint.config.js
// https://docs.expo.dev/guides/using-eslint/

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  // ── Base: Expo's opinionated flat config (includes React, React Native,
  //    TypeScript, and import rules out of the box)
  expoConfig,

  // ── Project-wide ignores
  {
    ignores: ['dist/*', 'build/*', '.expo/*', 'node_modules/*', 'coverage/*'],
  },

  // ── TypeScript path alias resolver
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },

  // ── Main rule set
  {
    rules: {
      // ── Naming conventions ────────────────────────────────────────────────
      // Enforce camelCase for variables, parameters, and functions.
      // PascalCase is allowed for React components and TypeScript types/interfaces.
      // SCREAMING_SNAKE_CASE is allowed for module-level constants.
      // No snake_case or kebab-case in identifiers.
      camelcase: 'off', // disabled in favour of @typescript-eslint/naming-convention below
      '@typescript-eslint/naming-convention': [
        'error',
        // Default: camelCase for everything not explicitly overridden
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow', // allow _unused prefixes
          trailingUnderscore: 'forbid',
        },
        // Variables: camelCase, or UPPER_CASE for true module-scope constants,
        // or PascalCase for React components stored in variables
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Functions: camelCase for plain functions, PascalCase for components
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        // Parameters: camelCase only
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // TypeScript types and interfaces: PascalCase
        {
          selector: 'typeLike', // covers class, interface, typeAlias, enum, typeParameter
          format: ['PascalCase'],
        },
        // Enum members: PascalCase (e.g. MyEnum.SomeValue)
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        // Object properties coming from external APIs may use any format,
        // so we relax the rule for properties specifically.
        {
          selector: 'property',
          format: null, // no restriction — AsyncStorage keys, RN StyleSheet keys, etc.
        },
        // Class members: camelCase
        {
          selector: 'classMethod',
          format: ['camelCase'],
        },
        {
          selector: 'classProperty',
          format: ['camelCase'],
        },
      ],

      // ── TypeScript quality ────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // too noisy for React components
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ── React ─────────────────────────────────────────────────────────────
      'react/no-unescaped-entities': 'warn',
      'react/self-closing-comp': 'warn',          // <View /> not <View></View>
      'react/jsx-boolean-value': ['warn', 'never'], // <Comp flag /> not <Comp flag={true} />
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never' },   // no unnecessary {} around strings
      ],

      // ── React Hooks ───────────────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── General JavaScript best-practices ─────────────────────────────────
      'no-var': 'error',             // always const/let
      'prefer-const': 'warn',        // use const when variable is never reassigned
      eqeqeq: ['error', 'always'],   // === over ==
      'no-console': 'warn',          // remove debug logs before merging
      'no-duplicate-imports': 'error',
      'object-shorthand': 'warn',    // { foo } not { foo: foo }
      'prefer-template': 'warn',     // template literals over string concatenation

      // ── Import ordering ───────────────────────────────────────────────────
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
]);
