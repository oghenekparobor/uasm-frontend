'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { AuthGuard } from '../auth/auth-guard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="flex flex-1 flex-col lg:ml-64">
          <Header onMenuClick={toggleSidebar} />
          <main className="flex-1 overflow-y-auto pt-16">
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

