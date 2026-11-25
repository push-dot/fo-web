import type { CareerStatus, Tenure, Profile } from '@push/api-client'

export type HubDraft = {
  tenure?: Tenure
  status?: CareerStatus
}

export type ProfileDraft = Pick<
  Profile,
  | 'displayName'
  | 'headline'
  | 'careerStatus'
  | 'jobCategory'
  | 'tenureYears'
  | 'intro'
  | 'careers'
  | 'skills'
> & { avatarKey?: string }
