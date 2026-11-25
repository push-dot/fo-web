import { LEGAL_DOCUMENTS } from '@push/shared'

export type LegalKind = 'terms' | 'privacy' | 'privacyConsent' | 'marketingConsent'

export const LEGAL_TABS = [
  { kind: 'terms', to: '/terms', label: '이용약관' },
  { kind: 'privacy', to: '/privacy', label: '개인정보 처리방침' },
] as const

export const LEGAL_DOC = {
  terms: LEGAL_DOCUMENTS.termsOfService,
  privacy: LEGAL_DOCUMENTS.privacyPolicy,
  privacyConsent: LEGAL_DOCUMENTS.privacyConsent,
  marketingConsent: LEGAL_DOCUMENTS.marketingConsent,
} as const
