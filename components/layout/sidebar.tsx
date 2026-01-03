'use client';

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

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const visibleItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-black text-white font-bold">
              U
            </div>
            <span className="text-xl font-bold">UAMS</span>
          </Link>
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
  );
}

