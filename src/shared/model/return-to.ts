import { CONTROL_CHARACTER, DEFAULT_RETURN_TO } from './constants'

export const sanitizeReturnTo = (value: string | null | undefined): string => {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('://') ||
    value.includes('\\') ||
    CONTROL_CHARACTER.test(value)
  ) {
    return DEFAULT_RETURN_TO
  }
  return value
}
