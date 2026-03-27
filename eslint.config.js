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
            camelcase: 'off',
            '@typescript-eslint/naming-convention': [
                'error',
                // Default: camelCase for everything not explicitly overridden
                {
                    selector: 'default',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'forbid',
                },
                // Variables: camelCase, UPPER_CASE for constants, PascalCase for components
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
                // Parameters: single uppercase letters are fully exempt (e.g. C for colors)
                {
                    selector: 'parameter',
                    format: null,
                    filter: {
                        regex: '^[A-Z]$',
                        match: true,
                    },
                },
                // Parameters: camelCase for everything else
                {
                    selector: 'parameter',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                    filter: {
                        regex: '^[A-Z]$',
                        match: false,
                    },
                },
                // Imported identifiers (React, SystemUI, etc.) may be PascalCase
                {
                    selector: 'import',
                    format: ['camelCase', 'PascalCase'],
                },
                // TypeScript types and interfaces: PascalCase
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                // Enum members: PascalCase
                {
                    selector: 'enumMember',
                    format: ['PascalCase'],
                },
                // Object properties: no restriction (AsyncStorage keys, StyleSheet keys, etc.)
                {
                    selector: 'property',
                    format: null,
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
            '@typescript-eslint/explicit-function-return-type': 'off',
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
            'react/self-closing-comp': 'warn',
            'react/jsx-boolean-value': ['warn', 'never'],
            'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

            // ── React Hooks ───────────────────────────────────────────────────────
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // ── General JavaScript best-practices ─────────────────────────────────
            'no-var': 'error',
            'prefer-const': 'warn',
            eqeqeq: ['error', 'always'],
            'no-console': 'warn',
            'no-duplicate-imports': 'error',
            'object-shorthand': 'warn',
            'prefer-template': 'warn',

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
