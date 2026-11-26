import type { ChatPerson } from '../types'

type PeoplePosting = { id: string; title: string; status?: string; applicantCount?: number }

type PeopleApplicant = { applicationId: string; applicant: { displayName: string } }

export const applicantPostings = <T extends PeoplePosting>(postings: T[], routedId: string | undefined) =>
  postings.filter((item) => item.id === routedId || (item.status !== 'DRAFT' && item.applicantCount !== 0))

export const chatPeople = (postings: PeoplePosting[], applicants: PeopleApplicant[][]): ChatPerson[] =>
  postings.flatMap((posting, index) =>
    (applicants[index] ?? []).map((item) => ({
      applicationId: item.applicationId,
      name: item.applicant.displayName,
      postingId: posting.id,
      postingTitle: posting.title,
    })),
  )

export const severalPostings = (people: ChatPerson[]) => new Set(people.map((person) => person.postingId)).size > 1
