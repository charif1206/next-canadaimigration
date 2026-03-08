/**
 * Permission Utilities
 */

interface User {
  username: string;
  role: string;
}

export function hasModeratorPermission(user: User | null): boolean {
  return user?.role === 'moderator';
}

export function canAccessAddAdminPage(isAuthenticated: boolean, user: User | null): boolean {
  return isAuthenticated && hasModeratorPermission(user);
}

export function getLoadingMessage(isAuthenticated: boolean): string {
  return isAuthenticated ? 'Checking permissions...' : 'Verifying authentication...';
}
