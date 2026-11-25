import type { ViewProps, TextProps } from './types'

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

const TextView = ({ props, context }: ViewProps<TextProps>) => {
  const title = !props.variant && context.componentModel.id === TITLE_ID
  return (
    <span className={title ? 'a2-tt' : (TEXT_CLASS[props.variant ?? 'body'] ?? 'a2-ds')}>
      {props.text ?? ''}
    </span>
  )
}

export default TextView
