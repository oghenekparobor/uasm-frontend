'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { membersApi } from '@/lib/api-services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface UpcomingBirthdaysProps {
  upcomingDays?: number;
  pastDays?: number;
}

function BirthdayRow({
  member,
  label,
  labelClassName,
  onClick,
}: {
  member: any;
  label: string;
  labelClassName?: string;
  onClick: () => void;
}) {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer touch-manipulation min-h-[44px]"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
            {getInitials(member.firstName, member.lastName)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">
              {member.firstName} {member.lastName}
            </p>
            {member.currentClass && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {member.currentClass.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-sm text-gray-600">
              {formatDate(
                member.nextBirthday ?? member.birthdayDate,
                { month: 'short', day: 'numeric' }
              )}
            </p>
            <span className={cn('text-xs px-2 py-0.5 rounded font-medium', labelClassName)}>
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpcomingBirthdays({
  upcomingDays = 7,
  pastDays = 7,
}: UpcomingBirthdaysProps) {
  const router = useRouter();
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [pastOpen, setPastOpen] = useState(false);

  const { data: upcoming, loading: loadingUpcoming, error: errorUpcoming } = useApi(() =>
    membersApi.getUpcomingBirthdays(upcomingDays)
  );
  const { data: past, loading: loadingPast, error: errorPast } = useApi(() =>
    membersApi.getPastBirthdays(pastDays)
  );

  const loading = loadingUpcoming || loadingPast;
  const hasUpcoming = upcoming && upcoming.length > 0;
  const hasPast = past && past.length > 0;

  if (loading && !upcoming && !past) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Birthdays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Birthdays</CardTitle>
        <p className="text-sm text-gray-500 font-normal mt-1">
          Next {upcomingDays} days · Last {pastDays} days
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Birthdays - collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setUpcomingOpen((o) => !o)}
            className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-900 hover:text-black transition-colors touch-manipulation min-h-[44px] -mx-1 px-1 rounded-lg hover:bg-gray-50"
            aria-expanded={upcomingOpen}
            aria-controls="upcoming-birthdays-list"
          >
            <span>
              Upcoming (next {upcomingDays} days)
              {hasUpcoming && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({upcoming.length})
                </span>
              )}
            </span>
            <svg
              className={cn('h-5 w-5 text-gray-500 shrink-0 transition-transform', upcomingOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="upcoming-birthdays-list"
            className={cn('overflow-hidden transition-all', upcomingOpen ? 'visible' : 'hidden')}
          >
            {loadingUpcoming ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : errorUpcoming ? (
              <p className="text-sm text-gray-500 py-2">Unable to load upcoming birthdays</p>
            ) : !hasUpcoming ? (
              <p className="text-sm text-gray-500 py-2">No birthdays in the next {upcomingDays} days</p>
            ) : (
              <div className="space-y-3 pt-1">
                {upcoming.map((member: any) => {
                  const isToday = member.daysUntil === 0;
                  const label = isToday
                    ? 'Today! 🎉'
                    : member.daysUntil === 1
                    ? 'Tomorrow'
                    : `${member.daysUntil} days`;
                  const labelClass = isToday
                    ? 'bg-red-100 text-red-700'
                    : member.daysUntil <= 3
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700';
                  return (
                    <BirthdayRow
                      key={member.id}
                      member={member}
                      label={label}
                      labelClassName={labelClass}
                      onClick={() => router.push(`/dashboard/members/${member.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Past Birthdays - collapsible */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setPastOpen((o) => !o)}
            className="flex w-full items-center justify-between py-2 text-left font-medium text-gray-900 hover:text-black transition-colors touch-manipulation min-h-[44px] -mx-1 px-1 rounded-lg hover:bg-gray-50"
            aria-expanded={pastOpen}
            aria-controls="past-birthdays-list"
          >
            <span>
              Past (last {pastDays} days)
              {hasPast && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({past.length})
                </span>
              )}
            </span>
            <svg
              className={cn('h-5 w-5 text-gray-500 shrink-0 transition-transform', pastOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="past-birthdays-list"
            className={cn('overflow-hidden transition-all', pastOpen ? 'visible' : 'hidden')}
          >
            {loadingPast ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : errorPast ? (
              <p className="text-sm text-gray-500 py-2">Unable to load past birthdays</p>
            ) : !hasPast ? (
              <p className="text-sm text-gray-500 py-2">No birthdays in the last {pastDays} days</p>
            ) : (
              <div className="space-y-3 pt-1">
                {past.map((member: any) => {
                  const label =
                    member.daysAgo === 0
                      ? 'Today'
                      : member.daysAgo === 1
                      ? 'Yesterday'
                      : `${member.daysAgo} days ago`;
                  return (
                    <BirthdayRow
                      key={member.id}
                      member={member}
                      label={label}
                      labelClassName="bg-gray-100 text-gray-700"
                      onClick={() => router.push(`/dashboard/members/${member.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
