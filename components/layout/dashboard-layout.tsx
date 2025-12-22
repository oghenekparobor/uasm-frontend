'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { AuthGuard } from '../auth/auth-guard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto pt-16">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

