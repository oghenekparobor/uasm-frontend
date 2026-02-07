'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 border-b border-gray-200 bg-white z-30">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Mobile menu button - min touch target 44px, touch-manipulation removes tap delay */}
        <button
          onClick={onMenuClick}
          className="lg:hidden min-w-[44px] min-h-[44px] p-2 -ml-2 flex items-center justify-center text-gray-600 hover:text-black active:text-black transition-colors relative z-[60] touch-manipulation cursor-pointer"
          aria-label="Toggle menu"
          type="button"
        >
          <svg
            className="h-6 w-6 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex-1 lg:flex-none">
          {/* Breadcrumbs or page title can go here */}
        </div>

        <div className="flex items-center gap-1 sm:gap-4">
          {/* Notifications - min 44x44px touch target */}
          <button
            type="button"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:text-black active:text-black transition-colors touch-manipulation"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" aria-hidden />
          </button>

          {/* User Menu - min 44px touch target */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 min-h-[44px] px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                {user?.firstName?.[0] || user?.email[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <svg
                className="h-4 w-4 text-gray-500 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                <div className="p-1">
                  <Link
                    href="/profile"
                    className="flex items-center min-h-[44px] px-3 py-2 text-sm rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center min-h-[44px] text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

