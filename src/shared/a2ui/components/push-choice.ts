import type { Question, Selected } from './types'

export const answerable = (question: Question) => question.answerable !== false

export const ownValue = <T>(record: Record<string, T> | undefined, id: string) =>
  record && Object.hasOwn(record, id) ? record[id] : undefined

export const allPicks = (questions: Question[], selected: Selected) =>
  questions
    .filter(answerable)
    .flatMap((question) =>
      question.choices
        .filter((choice) => (ownValue(selected, question.id) ?? []).includes(choice.id))
        .map((choice) => choice.id),
    )
