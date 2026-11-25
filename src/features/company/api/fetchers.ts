import {
  companiesMe as fetchMyCompany,
  companiesMembers as fetchMembers,
  companiesAcceptInvite as companiesAcceptInviteOp,
  companiesInvitePreview as companiesInvitePreviewOp,
  companiesUpdate,
  uploadsImage,
  companiesCancelInvite as cancelInvite,
  companiesInvite as companiesInviteOp,
  companiesInvites as listInvites,
  companiesRemoveMember as companiesRemoveMemberOp,
  companiesResendInvite as resendInvite,
  companiesTransferAdmin as companiesTransferAdminOp,
  companiesVerify as companiesVerifyOp,
} from '../../../shared/api/operations'

export const companiesMe = (...args: Parameters<typeof fetchMyCompany>) => fetchMyCompany(...args)

export const companiesMembers = (...args: Parameters<typeof fetchMembers>) => fetchMembers(...args)

export const companiesAcceptInvite = (...args: Parameters<typeof companiesAcceptInviteOp>) =>
  companiesAcceptInviteOp(...args)

export const companiesInvitePreview = (...args: Parameters<typeof companiesInvitePreviewOp>) =>
  companiesInvitePreviewOp(...args)

export const changeCompanyLogo = async (file: File) => {
  const form = new FormData()
  form.set('file', file)
  const { key } = await uploadsImage(form)
  return companiesUpdate({ logoKey: key })
}

export const companiesInvite = (...args: Parameters<typeof companiesInviteOp>) =>
  companiesInviteOp(...args)

export const companiesRemoveMember = (...args: Parameters<typeof companiesRemoveMemberOp>) =>
  companiesRemoveMemberOp(...args)

export const companiesTransferAdmin = (...args: Parameters<typeof companiesTransferAdminOp>) =>
  companiesTransferAdminOp(...args)

export const companiesInvites = (...args: Parameters<typeof listInvites>) => listInvites(...args)

export const companiesResendInvite = (...args: Parameters<typeof resendInvite>) =>
  resendInvite(...args)

export const companiesCancelInvite = (...args: Parameters<typeof cancelInvite>) =>
  cancelInvite(...args)

export const companiesVerify = (...args: Parameters<typeof companiesVerifyOp>) =>
  companiesVerifyOp(...args)
