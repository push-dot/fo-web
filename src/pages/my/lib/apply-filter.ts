import type { Application, ApplicationStage } from '@push/api-client'

export type ApplyFilter = 'all' | 'active' | 'done'

const DONE_STAGES: ApplicationStage[] = ['OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']

const phase = (stage: ApplicationStage): Exclude<ApplyFilter, 'all'> => (DONE_STAGES.includes(stage) ? 'done' : 'active')

export const applyCounts = (items: Pick<Application, 'stage'>[]): Record<ApplyFilter, number> => {
  const done = items.filter((item) => phase(item.stage) === 'done').length
  return { all: items.length, active: items.length - done, done }
}

export const filterApplications = <T extends Pick<Application, 'stage'>>(items: T[], filter: ApplyFilter) =>
  filter === 'all' ? items : items.filter((item) => phase(item.stage) === filter)

export { applicationStageTone as stageTone } from '../../../entities/application/stage-label'

export const appliedLine = (item: Pick<Application, 'company' | 'appliedAt' | 'createdAt'>) => {
  const date = new Date(item.appliedAt ?? item.createdAt)
  return `${item.company} · ${date.getMonth() + 1}월 ${date.getDate()}일 지원`
}
