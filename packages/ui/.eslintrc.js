module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:vue/vue3-recommended'
  ],
  parser: 'vue-eslint-parser', // 使用 vue-eslint-parser 作为主解析器
  parserOptions: {
    parser: '@typescript-eslint/parser', // 在 parserOptions 中指定 TypeScript 的解析器
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-undef': 'off',
    'no-useless-call': 'off',
    'vue/multi-word-component-names': 'off'
  }
}
