import type { ViewProps } from './view'

export type TextProps = { text?: string; variant?: string }

// v0.9.1 sends h1–h5, caption and body; 1.0 only caption and body.
const TEXT_CLASS: Record<string, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'a2-tt',
  h4: 'a2-tt',
  h5: 'a2-tt',
  caption: 'a2-cp',
  body: 'a2-ds',
}

// 1.0 has no plain-text heading, so push-be sends the approval question as a body Text with the id `title`.
const TITLE_ID = 'title'

/** Push override of the basic Text: plain text, never Markdown (a file name's `_` must not turn italic). */
export const TextView = ({ props, context }: ViewProps<TextProps>) => {
  const title = !props.variant && context.componentModel.id === TITLE_ID
  return (
    <span className={title ? 'a2-tt' : (TEXT_CLASS[props.variant ?? 'body'] ?? 'a2-ds')}>
      {props.text ?? ''}
    </span>
  )
}

type ChildRef = string | { id: string; basePath?: string }

export type ListProps = {
  children?: ChildRef[]
  direction?: 'vertical' | 'horizontal'
  align?: string
}

/** Push override of the basic List: a plain, non-lazy column or row. */
export const ListView = ({ props, buildChild }: ViewProps<ListProps>) => (
  <div className={props.direction === 'horizontal' ? 'a2-list row' : 'a2-list'}>
    {(props.children ?? []).map((child) =>
      typeof child === 'string' ? (
        <div key={child}>{buildChild(child)}</div>
      ) : (
        <div key={`${child.basePath ?? ''}/${child.id}`}>
          {buildChild(child.id, child.basePath)}
        </div>
      ),
    )}
  </div>
)
