import { web } from '@push/eslint-config'

export default [
  { ignores: ['dist/**'] },
  ...web({
    uiFiles: ['src/pages/**', 'src/features/*/components/**', 'src/shared/ui/**'],
    infraModules: ['@push/api-client'],
  }),
]
