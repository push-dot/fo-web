import type { ComponentContext } from '@a2ui/web_core/v0_9'
import type { ReactNode } from 'react'

export type Choice = {
  id: string
  label: string
  desc?: string
  recommended?: boolean
  change?: boolean
}

export type TextProps = { text?: string; variant?: string }

type ChildRef = string | { id: string; basePath?: string }

export type ListProps = {
  children?: ChildRef[]
  direction?: 'vertical' | 'horizontal'
  align?: string
}

export type PushTodoProps = { items: { text: string; state: 'done' | 'running' | 'waiting' }[] }

export type PushDiffProps = {
  caption?: string
  title: string
  lines: { sign: '+' | '-' | ''; text: string }[]
  documentId?: string
}

export type PushPlanProps = {
  caption?: string
  title: string
  rows: { tag: string; tone: 'accent' | 'green' | 'orange'; label: string; note: string }[]
  keywords?: string[]
}

export type PushFitProps = {
  score: string
  sentence: string
  summary?: string
  items?: { label: string; score: number }[]
  missing?: string[]
  rounds?: string[]
  locked?: boolean
}

export type PushDocumentProps = {
  status: 'done' | 'writing' | 'failed'
  title: string
  name: string
  meta?: string
  lines?: string[]
  documentId?: string
  share?: boolean
  actions?: { id: string; label: string; method?: string; path?: string }[]
}

export type PushJobCardProps = {
  postingId: string
  company: string
  title: string
  meta?: string
  imageUrl?: string
  bookmarked?: boolean
}

export type Question = {
  id: string
  title?: string
  detail?: string
  multiple?: boolean
  answerable?: boolean
  choices: Choice[]
}

export type Selected = Record<string, string[]>

export type PushChoiceProps = {
  form?: 'list' | 'buttons'
  questions: Question[]
  answer: 'pick' | 'submit'
  submit?: { label: string; labels?: Record<string, string> }
  secondary?: { id: string; label: string }
  open: boolean
  picked: string[]
  selected?: Selected
  setSelected?: (value: Selected) => void
}

export type ViewProps<P> = {
  props: P
  context: ComponentContext
  buildChild: (id: string, basePath?: string) => ReactNode
}
