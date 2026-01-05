'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: Object.values(ROLES),
  },
  {
    label: 'Members',
    href: '/members',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PLATOON_LEADER,
      ROLES.ASSISTANT_PLATOON_LEADER,
      ROLES.CHILDREN_TEACHER,
    ],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PLATOON_LEADER,
      ROLES.ASSISTANT_PLATOON_LEADER,
      ROLES.CHILDREN_TEACHER,
      ROLES.DISTRIBUTION,
    ],
  },
  {
    label: 'Classes',
    href: '/classes',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PLATOON_LEADER,
      ROLES.ASSISTANT_PLATOON_LEADER,
      ROLES.CHILDREN_TEACHER,
    ],
  },
  {
    label: 'Users',
    href: '/users',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    label: 'Distribution',
    href: '/distribution',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DISTRIBUTION],
  },
  {
    label: 'Kitchen',
    href: '/kitchen',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.KITCHEN],
  },
  {
    label: 'Empowerment',
    href: '/empowerment',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PLATOON_LEADER,
    ],
  },
  {
    label: 'Events',
    href: '/events',
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.ADMIN,
      ROLES.PLATOON_LEADER,
    ],
  },
  {
    label: 'Requests',
    href: '/requests',
    roles: Object.values(ROLES),
  },
  {
    label: 'Activity Logs',
    href: '/activity-logs',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  if (!user) return null;

  // Get all roles the user has (primary role + additional roles)
  const userRoles = [
    user.role,
    ...(user.roles || []).map((r: any) => typeof r === 'string' ? r : r.role || r.name),
  ].filter(Boolean);

  // If user has platoonIds (class assignments), they should be treated as a leader
  // even if their primary role is 'worker'
  const hasClassAssignments = user.platoonIds && user.platoonIds.length > 0;
  const effectiveRoles = hasClassAssignments 
    ? [...userRoles, 'platoon_leader', 'assistant_platoon_leader', 'children_teacher']
    : userRoles;

  const visibleItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    // Check if user has any of the required roles (including effective roles from class assignments)
    return item.roles.some((requiredRole) => effectiveRoles.includes(requiredRole));
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white z-50 transition-transform duration-300 ease-in-out',
          // On desktop (lg+), always visible
          'lg:translate-x-0',
          // On mobile, show/hide based on isOpen state
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black text-white font-bold">
                U
              </div>
              <span className="text-xl font-bold">UAMS</span>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

