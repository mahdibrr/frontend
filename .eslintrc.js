module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn', // Change unused vars from error to warning
    '@typescript-eslint/no-explicit-any': 'warn'   // Change explicit any warnings as well
    // ...other rule overrides if needed...
  }
};
