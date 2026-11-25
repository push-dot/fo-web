import type { ApplicationStage } from '@push/api-client'

export const applicationStageTone = (stage: ApplicationStage) => {
  if (stage === 'SCREENING') return 'ac'
  if (stage === 'INTERVIEW') return 'orange'
  if (stage === 'OFFER' || stage === 'ACCEPTED') return 'green'
  if (stage === 'REJECTED' || stage === 'WITHDRAWN') return 'red'
  return 'grey'
}

export const employerStageLabel = (stage: ApplicationStage) => {
  if (stage === 'APPLIED') return '지원함'
  if (stage === 'SCREENING') return '서류 통과'
  if (stage === 'INTERVIEW') return '면접'
  if (stage === 'OFFER' || stage === 'ACCEPTED') return '합격'
  if (stage === 'REJECTED' || stage === 'WITHDRAWN') return '불합격'
  return '준비 중'
}
