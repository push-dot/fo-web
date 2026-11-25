import type { ViewProps, ListProps } from './types'

const ListView = ({ props, buildChild }: ViewProps<ListProps>) => (
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

export default ListView
