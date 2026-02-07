import { redirect } from 'next/navigation';

/**
 * /dashboard has no content; the dashboard home is at /dashboard/dashboard.
 * Redirect so direct requests (e.g. refresh, deep link) to /dashboard work.
 */
export default function DashboardIndexPage() {
  redirect('/dashboard/dashboard');
}
