import { searchCatalog as fetchCatalog } from '../../../shared/api/operations'

export const searchCatalog = (...args: Parameters<typeof fetchCatalog>) => fetchCatalog(...args)
