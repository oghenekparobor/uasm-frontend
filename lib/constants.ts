export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const ROLES = {
  WORKER: 'worker',
  PLATOON_LEADER: 'platoon_leader',
  ASSISTANT_PLATOON_LEADER: 'assistant_platoon_leader',
  CHILDREN_TEACHER: 'children_teacher',
  KITCHEN: 'kitchen',
  DISTRIBUTION: 'distribution',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy for UI visibility
export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.WORKER]: 1,
  [ROLES.CHILDREN_TEACHER]: 2,
  [ROLES.ASSISTANT_PLATOON_LEADER]: 3,
  [ROLES.PLATOON_LEADER]: 4,
  [ROLES.KITCHEN]: 5,
  [ROLES.DISTRIBUTION]: 6,
  [ROLES.ADMIN]: 7,
  [ROLES.SUPER_ADMIN]: 8,
};

// Check if user has required role or higher
export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

// Check if user has any of the required roles
export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.some((role) => hasRole(userRole, role));
}
