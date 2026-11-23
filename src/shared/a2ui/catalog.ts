import { createComponentImplementation, type ReactCatalogComponent } from '@a2ui/react/v0_9'
import type { Catalog, ComponentApi } from '@a2ui/web_core/v0_9'
import type { FC } from 'react'
import { ListView, TextView } from './components/basic'
import {
  PushDiffView,
  PushDocumentView,
  PushFitView,
  PushJobCardView,
  PushPlanView,
  PushTodoView,
} from './components/push-cards'
import { PushChoiceView } from './components/push-choice'
import type { ViewProps } from './components/view'
import { A2UI_PROTOCOL, PUSH_CATALOG_ID, type A2uiProtocol } from './protocol'
import { pushSchemas } from './schemas'

// The binder resolves bindings to plain values, which each view types for itself.
const implement = <P>(api: ComponentApi, view: FC<ViewProps<P>>) =>
  createComponentImplementation(
    api,
    view as unknown as Parameters<typeof createComponentImplementation>[1],
  )

/**
 * The Push catalog for web: the official basic catalog of the protocol with `Text` and `List` drawn by Push (same
 * schemas), plus the seven Push components. One catalog per surface, as v0.9.1 and v1.0 require.
 */
export const pushCatalog = (protocol: A2uiProtocol): Catalog<ReactCatalogComponent> => {
  const basic = protocol.basic.components
  const schema = (name: string) => {
    const found = basic.get(name)
    if (!found) throw new Error(`basic catalog has no ${name}`)
    return found.schema
  }
  const push = pushSchemas(protocol)
  const own = [
    implement({ name: 'Text', schema: schema('Text') }, TextView),
    implement({ name: 'List', schema: schema('List') }, ListView),
    implement({ name: 'PushChoice', schema: push.PushChoice }, PushChoiceView),
    implement({ name: 'PushTodo', schema: push.PushTodo }, PushTodoView),
    implement({ name: 'PushDiff', schema: push.PushDiff }, PushDiffView),
    implement({ name: 'PushPlan', schema: push.PushPlan }, PushPlanView),
    implement({ name: 'PushFit', schema: push.PushFit }, PushFitView),
    implement({ name: 'PushDocument', schema: push.PushDocument }, PushDocumentView),
    implement({ name: 'PushJobCard', schema: push.PushJobCard }, PushJobCardView),
  ]
  const kept = [...basic.keys()].filter((name) => name !== 'Text' && name !== 'List')
  // derive keeps the basic functions and the protocol version; the Push entries replace or add by name.
  return protocol.basic.derive({
    catalogId: PUSH_CATALOG_ID,
    components: [...kept, ...own],
  } as never) as never
}

export const PUSH_CATALOG = pushCatalog(A2UI_PROTOCOL)
