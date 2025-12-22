import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'UAMS - Urban Alternative Management System',
  description: 'Internal management platform for Urban Alternative',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
