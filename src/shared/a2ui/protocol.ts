import { basicCatalog } from '@a2ui/web_core/catalogs/basic/v1'
import { A2UI_VERSION } from './version'

/** What differs between the A2UI versions the web renderer can speak. Everything else in the catalog is shared. */
export type A2uiProtocol = {
  /** The processor's version. */
  version: string
  /** The official basic catalog of that version (v0.9.1: `@a2ui/web_core/v0_9/basic_catalog`). */
  basic: Pick<typeof basicCatalog, 'components' | 'derive'>
  /** The key of a data binding: `{path}` in v0.9.1, `{"@path"}` in v1.0. */
  bindingKey: 'path' | '@path'
}

/** The protocol the app draws. Only the active basic catalog is imported, so only one ships. */
export const A2UI_PROTOCOL: A2uiProtocol = {
  version: A2UI_VERSION,
  basic: basicCatalog,
  bindingKey: '@path',
}

/** The Push catalog id of `createSurface`: one id for both protocol versions (push-be a2ui README, catalog id rule). */
export const PUSH_CATALOG_ID = 'https://push.app/a2ui/catalogs/push/v1/catalog.json'
