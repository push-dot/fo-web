import type { A2uiVersion } from '@push/api-client'

/**
 * The A2UI version web draws, sent as `A2UI-Version` on every request that returns Bot frames (mock mode included):
 * push-be reads a missing header as v0.9.1, which web never draws. Kept apart from the renderer so the API client does
 * not pull it into the main bundle. Changing it means the basic catalog in protocol.ts and the fixture set change too.
 */
export const A2UI_VERSION: A2uiVersion = '1.0'
