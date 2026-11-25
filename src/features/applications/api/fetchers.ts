import {
  applicationsList as fetchApplications,
  calendarEvents as fetchCalendar,
  postingsApplicant as fetchApplicant,
  postingsApplicantCounts as fetchApplicantCounts,
  postingsApplicantFile as fetchApplicantFile,
  postingsApplicants as fetchApplicants,
  calendarCreate as calendarCreateOp,
  postingsSetApplicantStage as postingsSetApplicantStageOp,
} from '../../../shared/api/operations'

export const applicationsList = (...args: Parameters<typeof fetchApplications>) =>
  fetchApplications(...args)

export const calendarEvents = (...args: Parameters<typeof fetchCalendar>) => fetchCalendar(...args)

export const postingsApplicant = (...args: Parameters<typeof fetchApplicant>) =>
  fetchApplicant(...args)

export const postingsApplicantFile = (...args: Parameters<typeof fetchApplicantFile>) =>
  fetchApplicantFile(...args)

export const postingsApplicantCounts = (...args: Parameters<typeof fetchApplicantCounts>) =>
  fetchApplicantCounts(...args)

export const postingsApplicants = (...args: Parameters<typeof fetchApplicants>) =>
  fetchApplicants(...args)

export const calendarCreate = (...args: Parameters<typeof calendarCreateOp>) =>
  calendarCreateOp(...args)

export const postingsSetApplicantStage = (
  ...args: Parameters<typeof postingsSetApplicantStageOp>
) => postingsSetApplicantStageOp(...args)
