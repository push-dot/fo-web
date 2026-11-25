import type { ComponentContext } from '@a2ui/web_core/v0_9'

export const dispatch = (context: ComponentContext, name: string, payload: object) =>
  void context.dispatchAction({ event: { name, context: payload } })
