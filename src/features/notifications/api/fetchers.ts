import {
  meWebNotifications as fetchNotifications,
  meReadNotifications as meReadNotificationsOp,
} from '../../../shared/api/operations'

export const meWebNotifications = (...args: Parameters<typeof fetchNotifications>) =>
  fetchNotifications(...args)

export const meReadNotifications = (...args: Parameters<typeof meReadNotificationsOp>) =>
  meReadNotificationsOp(...args)
