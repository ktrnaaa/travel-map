// Імпортуємо стандартні рекомендовані правила ESLint
import js from '@eslint/js';

// Вимкнення конфліктних стилістичних правил ESLint
import prettier from 'eslint-config-prettier';

// Імпортуємо плагін для перевірки імпортів (виявлення помилок і порядок)
import eslintPluginImport from 'eslint-plugin-import';

// Імпортуємо плагін для перевірки React-компонентів
import react from 'eslint-plugin-react';

// Імпортуємо плагін для перевірки правильного використання хуків React
import reactHooks from 'eslint-plugin-react-hooks';

// Імпортуємо плагін для підтримки HMR (react-refresh)
import reactRefresh from 'eslint-plugin-react-refresh';

// Імпортуємо глобальні змінні браузера (window, document тощо)
import globals from 'globals';

export default [
  // Вказуємо, які папки ігнорувати (замість .eslintignore)
  { ignores: ['dist', 'node_modules'] },

  {
    // Застосовувати правила лише до JS та JSX файлів
    files: ['**/*.{js,jsx}'],

    // Налаштування мови JavaScript
    languageOptions: {
      ecmaVersion: 2020, // Підтримка сучасного JS
      globals: globals.browser, // Глобальні змінні браузера (window, document тощо)
      parserOptions: {
        ecmaVersion: 'latest', // Використовувати найновішу версію JS
        ecmaFeatures: { jsx: true }, // Увімкнути підтримку JSX
        sourceType: 'module', // Підтримка імпортів/експортів
      },
    },

    // Підключаємо ESLint плагіни
    plugins: {
      'react-hooks': reactHooks, // Перевірка хуків
      'react-refresh': reactRefresh, // Підтримка HMR
      react: react, // React-правила
      import: eslintPluginImport, // Правила для імпортів
    },

    // Встановлюємо ESLint правила
    rules: {
      ...js.configs.recommended.rules, // Базові рекомендовані правила ESLint
      ...reactHooks.configs.recommended.rules, // Рекомендовані правила для хуків React
      ...react.configs.recommended.rules, // Рекомендовані правила для React

      // Не дозволяти невикористані змінні, крім тих, що починаються з великої літери або _
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // React Refresh: попередження, якщо компонент експортується не як константа
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Помилка, якщо імпорт не знайдено
      'import/no-unresolved': 'error',

      // Вимога порядку імпортів
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // Вбудовані модулі Node.js
            'external', // Пакети з npm
            'internal', // Абсолютні імпорти (через alias)
            ['parent', 'sibling', 'index'], // Відносні імпорти
          ],
          'newlines-between': 'always', // Порожній рядок між групами імпортів
          alphabetize: { order: 'asc', caseInsensitive: true }, // Сортувати імпорти за алфавітом
        },
      ],
      ...prettier.rules, // вимикає конфліктні правила форматування
    },

    // Автоматичне визначення версії React
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
