const NOTIFICATIONS_UPDATED = 'notifications-updated'

export function notifyUnreadCountUpdated() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED))
}

export function getNotificationsUpdatedEventName() {
  return NOTIFICATIONS_UPDATED
}
