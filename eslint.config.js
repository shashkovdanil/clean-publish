import loguxConfig from '@logux/eslint-config'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['test/package/**']
  },
  ...loguxConfig,
  {
    rules: {
      'n/global-require': 'off',
      'no-console': 'off',
      'prefer-let/prefer-let': 'off'
    }
  }
]
