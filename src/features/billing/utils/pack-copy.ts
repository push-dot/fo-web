import { creditText } from './credit-count'
import { MAX_PACKS, PACK_CREDITS, formatKrw } from './employer-plans'

export const planBuyPackHint = (packPrice: number) =>
  `1팩에 ${creditText(PACK_CREDITS)}크레딧 · ${formatKrw(packPrice)}이에요. 한 번에 ${MAX_PACKS}팩까지 살 수 있어요.`

export const buyTotal = (packs: number, packPrice: number) =>
  `${creditText(packs * PACK_CREDITS)}크레딧 · ${formatKrw(packs * packPrice)}`
