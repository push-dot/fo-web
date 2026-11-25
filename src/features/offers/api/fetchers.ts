import {
  meOffer as fetchOffer,
  meOfferMessages as fetchOfferMessages,
  meOffers as fetchOffers,
  meAcceptOffer as meAcceptOfferOp,
  meArchiveOffer as meArchiveOfferOp,
  meBlockUser as meBlockUserOp,
  meDeclineOffer as meDeclineOfferOp,
  meReportOffer as meReportOfferOp,
  meSendOfferMessage as meSendOfferMessageOp,
  meUnarchiveOffer as meUnarchiveOfferOp,
  profilesOffer as profilesOfferOp,
} from '../../../shared/api/operations'

export const meOffers = (...args: Parameters<typeof fetchOffers>) => fetchOffers(...args)

export const meOffer = (...args: Parameters<typeof fetchOffer>) => fetchOffer(...args)

export const meOfferMessages = (...args: Parameters<typeof fetchOfferMessages>) =>
  fetchOfferMessages(...args)

export const meAcceptOffer = (...args: Parameters<typeof meAcceptOfferOp>) =>
  meAcceptOfferOp(...args)

export const meDeclineOffer = (...args: Parameters<typeof meDeclineOfferOp>) =>
  meDeclineOfferOp(...args)

export const meSendOfferMessage = (...args: Parameters<typeof meSendOfferMessageOp>) =>
  meSendOfferMessageOp(...args)

export const meArchiveOffer = (...args: Parameters<typeof meArchiveOfferOp>) =>
  meArchiveOfferOp(...args)

export const meUnarchiveOffer = (...args: Parameters<typeof meUnarchiveOfferOp>) =>
  meUnarchiveOfferOp(...args)

export const meReportOffer = (...args: Parameters<typeof meReportOfferOp>) =>
  meReportOfferOp(...args)

export const meBlockUser = (...args: Parameters<typeof meBlockUserOp>) => meBlockUserOp(...args)

export const profilesOffer = (...args: Parameters<typeof profilesOfferOp>) =>
  profilesOfferOp(...args)
