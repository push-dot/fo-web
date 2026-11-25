import { canInterviewPrep, canUploadExternalPdf, type EmployerPlanId } from '../../billing'
import type { ChatIntent } from './employer-chat'

export const intentLocked = (intent: ChatIntent, plan: EmployerPlanId): 'PRO' | 'ULTRA' | null =>
  intent === 'interview' && !canInterviewPrep(plan) ? 'PRO' : null

export const pdfLocked = (plan: EmployerPlanId): boolean => !canUploadExternalPdf(plan)
