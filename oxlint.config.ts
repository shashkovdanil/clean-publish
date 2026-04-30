import loguxOxlintConfig from '@logux/oxc-configs/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [loguxOxlintConfig],
  rules: {
    'prefer-let/prefer-let': 'off',
    'node/global-require': 'off'
  }
})
