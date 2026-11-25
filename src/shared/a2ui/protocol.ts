import { basicCatalog } from '@a2ui/web_core/catalogs/basic/v1'
import { A2UI_VERSION } from './version'

export type A2uiProtocol = {
  version: string
  basic: Pick<typeof basicCatalog, 'components' | 'derive'>
  bindingKey: 'path' | '@path'
}

export const A2UI_PROTOCOL: A2uiProtocol = {
  version: A2UI_VERSION,
  basic: basicCatalog,
  bindingKey: '@path',
}

export const PUSH_CATALOG_ID = 'https://push.app/a2ui/catalogs/push/v1/catalog.json'
