import {
  meUpdateSettings as meUpdateSettingsOp,
  meDeleteAccount as meDeleteAccountOp,
  meUnblockUser as meUnblockUserOp,
} from '../../../shared/api/operations'

export const meUpdateSettings = (...args: Parameters<typeof meUpdateSettingsOp>) =>
  meUpdateSettingsOp(...args)
export const meDeleteAccount = (...args: Parameters<typeof meDeleteAccountOp>) =>
  meDeleteAccountOp(...args)
export const meUnblockUser = (...args: Parameters<typeof meUnblockUserOp>) =>
  meUnblockUserOp(...args)
