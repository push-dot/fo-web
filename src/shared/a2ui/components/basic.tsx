import type { ViewProps } from './view'

export type TextProps = { text?: string; variant?: string }

const TEXT_CLASS: Record<string, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'a2-tt',
  h4: 'a2-tt',
  h5: 'a2-tt',
  caption: 'a2-cp',
  body: 'a2-ds',
}

const TITLE_ID = 'title'

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
