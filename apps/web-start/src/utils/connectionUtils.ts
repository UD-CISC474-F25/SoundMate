import type { UserProfile } from '../hooks/useUserSearch';

/**
 * Connection status types used by the ConnectionButton component
 */
export type ConnectionButtonStatus = 
  | "NONE" 
  | "PENDING_SENT" 
  | "PENDING_RECEIVED" 
  | "ACCEPTED";

/**
 * Connection status types from the API
 */
export type APIConnectionStatus = 
  | "NONE" 
  | "PENDING" 
  | "ACCEPTED";

/**
 * Maps API connection status to ConnectionButton status format
 * @param connectionStatus - Status from API ('NONE' | 'PENDING' | 'ACCEPTED')
 * @param isPendingFromThem - Whether the pending connection is from the other user
 * @returns Status format for ConnectionButton component
 */
export function getConnectionButtonStatus(
  connectionStatus?: APIConnectionStatus,
  isPendingFromThem?: boolean
): ConnectionButtonStatus {
  if (connectionStatus === 'ACCEPTED') {
    return 'ACCEPTED';
  }
  
  if (connectionStatus === 'PENDING') {
    return isPendingFromThem ? 'PENDING_RECEIVED' : 'PENDING_SENT';
  }
  
  return 'NONE';
}

/**
 * Maps UserProfile to ConnectionButton status
 * @param user - User profile object
 * @returns Status format for ConnectionButton component
 */
export function getUserConnectionStatus(user: UserProfile): ConnectionButtonStatus {
  return getConnectionButtonStatus(user.connectionStatus, user.isPendingFromThem);
}

/**
 * Gets a human-readable label for connection status
 * @param status - ConnectionButton status
 * @returns Human-readable label
 */
export function getConnectionStatusLabel(status: ConnectionButtonStatus): string {
  switch (status) {
    case 'NONE':
      return 'Not Connected';
    case 'PENDING_SENT':
      return 'Request Sent';
    case 'PENDING_RECEIVED':
      return 'Request Received';
    case 'ACCEPTED':
      return 'Friends';
    default:
      return 'Unknown';
  }
}

/**
 * Checks if a connection action is available
 * @param status - ConnectionButton status
 * @param action - Action to check
 * @returns Whether the action is available
 */
export function canPerformAction(
  status: ConnectionButtonStatus,
  action: 'connect' | 'accept' | 'cancel'
): boolean {
  switch (action) {
    case 'connect':
      return status === 'NONE';
    case 'accept':
      return status === 'PENDING_RECEIVED';
    case 'cancel':
      return status === 'PENDING_SENT' || status === 'PENDING_RECEIVED' || status === 'ACCEPTED';
    default:
      return false;
  }
}