export default {
  extends: ['plugin:vue/vue3-recommended', 'prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  root: true,
  rules: {
    semi: 'off',
    'prefer-const': 'off',
    'no-console': 'off',
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    'promise/param-names': 'off',
    'no-use-before-define': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': ['off'],
    'import/named': 'off',
  },
};
