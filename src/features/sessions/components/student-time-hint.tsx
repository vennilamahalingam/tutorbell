import { Text } from 'react-native';

import { formatDateTime } from '@/lib/time';

/** "That's Tue 6 Oct, 8:00 AM for Aarav (America/New_York)" — catches timezone mistakes early. */
export function StudentTimeHint({
  startsAtUtc,
  studentName,
  studentZone,
  tutorZone,
}: {
  startsAtUtc: string;
  studentName: string;
  studentZone: string;
  tutorZone: string;
}) {
  if (studentZone === tutorZone) return null;
  return (
    <Text className="rounded-xl bg-brand-soft px-4 py-3 text-brand">
      That's {formatDateTime(startsAtUtc, studentZone)} for {studentName} ({studentZone})
    </Text>
  );
}
