import loguxConfig from '@logux/eslint-config'

/** @type {import('eslint').FlatConfig[]} */
export default [
  {
    ignores: ['test/package/**']
  },
  ...loguxConfig,
  {
    rules: {
      'n/global-require': 'off',
      'n/no-unsupported-features/node-builtins': [
        'error',
        { ignores: ['fs/promises.cp'] }
      ],
      'no-console': 'off',
      'prefer-let/prefer-let': 'off'
    }
  }
]
