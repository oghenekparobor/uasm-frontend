'use client';

import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { membersApi } from '@/lib/api-services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils/date';

interface UpcomingBirthdaysProps {
  upcomingDays?: number;
}

export function UpcomingBirthdays({ upcomingDays = 7 }: UpcomingBirthdaysProps) {
  const router = useRouter();
  const { data: birthdays, loading, error } = useApi(() =>
    membersApi.getUpcomingBirthdays(upcomingDays)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Birthdays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Birthdays</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Unable to load birthdays</p>
        </CardContent>
      </Card>
    );
  }

  if (!birthdays || birthdays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Birthdays</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No birthdays in the next {upcomingDays} days
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Birthdays</CardTitle>
        <p className="text-sm text-gray-500 font-normal">
          Next {upcomingDays} days
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {birthdays.map((member: any) => {
            const isToday = member.daysUntil === 0;
            const daysText = isToday
              ? 'Today! 🎉'
              : member.daysUntil === 1
              ? 'Tomorrow'
              : `${member.daysUntil} days`;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/members/${member.id}`)}
              >
                <div className="flex items-center gap-3 flex-1">
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.currentClass && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {member.currentClass.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">
                        {formatDate(member.nextBirthday, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          isToday
                            ? 'bg-red-100 text-red-700'
                            : member.daysUntil <= 3
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {daysText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

