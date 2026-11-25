import type { ApplicationStage, EmployerStage } from '@push/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationsGoogle as fetchGoogle } from '../../../shared/api/operations'
import {
  applicationsList,
  calendarEvents,
  postingsApplicant,
  postingsApplicantCounts,
  postingsApplicants,
  postingsSetApplicantStage,
} from './fetchers'

export const useApplications = (enabled = true) =>
  useQuery({ queryKey: ['applications'], queryFn: () => applicationsList(), enabled })

export const useCalendar = (from: string, to: string, enabled: boolean) =>
  useQuery({
    queryKey: ['calendar', from, to],
    queryFn: () => calendarEvents(from, to),
    enabled,
  })

export const useGoogleIntegration = (enabled: boolean) =>
  useQuery({
    queryKey: ['integrations', 'google'],
    queryFn: () => fetchGoogle(),
    enabled,
    retry: false,
  })

export const useEmployerApplicant = (
  postingId: string | undefined,
  applicationId: string | undefined,
) =>
  useQuery({
    queryKey: ['employer-applicant', postingId, applicationId],
    queryFn: () => postingsApplicant(postingId ?? '', applicationId ?? ''),
    enabled: Boolean(postingId && applicationId),
  })

export const useEmployerApplicants = (
  postingId: string | undefined,
  stage: ApplicationStage | null | undefined,
  options?: { queryKey?: unknown[]; enabled?: boolean },
) =>
  useQuery({
    queryKey: options?.queryKey ?? ['employer-applicants', postingId, stage],
    queryFn: () =>
      stage
        ? postingsApplicants(postingId ?? '', { stage })
        : postingsApplicants(postingId ?? '', {}),
    enabled: options?.enabled ?? Boolean(postingId),
  })

export const useApplicantCounts = (postingId: string | undefined) =>
  useQuery({
    queryKey: ['employer-applicant-counts', postingId],
    queryFn: () => postingsApplicantCounts(postingId ?? ''),
    enabled: Boolean(postingId),
  })

type Move = { applicationId: string; stage: EmployerStage }

export const useStageMove = (postingId: string | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, stage }: Move) =>
      postingsSetApplicantStage(postingId ?? '', applicationId, stage),
    onSuccess: async () => {
      await Promise.all(
        ['employer-applicants', 'employer-applicant-counts', 'employer-applicant'].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key, postingId] }),
        ),
      )
    },
  })
}
