import { useEffect, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { OptionRow, type OptionTone } from '@/components/ui/option-row';
import type { IconName } from '@/components/ui/icon-paths';
import { useSnackbar } from '@/components/ui/snackbar';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme/theme-provider';
import type { AttendanceStatus, SessionWithStudent } from '../api';
import { useMarkAttendance } from '../queries';
import { formatStudentLocal, formatTime } from '@/lib/time';
import { DateTime } from 'luxon';

const NOTE_MAX = 140;

const OPTIONS: {
  status: AttendanceStatus;
  label: string;
  icon: IconName;
  iconColor: string;
  tone: OptionTone;
}[] = [
  {
    status: 'attended',
    label: 'Attended',
    icon: 'check_circle',
    iconColor: 'success-stroke',
    tone: 'success',
  },
  { status: 'absent', label: 'Absent', icon: 'person_off', iconColor: 'error-icon', tone: 'error' },
  {
    status: 'cancelled',
    label: 'Cancelled',
    icon: 'block',
    iconColor: 'cancel-icon',
    tone: 'cancel',
  },
];

/**
 * 2d — Mark attendance. `queue` lets "Needs attendance → Mark" step through several classes;
 * after the last one: "Register's all caught up. Chai break?"
 */
export function MarkAttendanceSheet({
  queue,
  tutorZone,
  onClose,
}: {
  queue: SessionWithStudent[];
  tutorZone: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const session = queue[index];
  const [status, setStatus] = useState<AttendanceStatus>('attended');
  const [note, setNote] = useState('');
  const [focused, setFocused] = useState(false);
  const mark = useMarkAttendance();
  const snackbar = useSnackbar();
  const { colors } = useTheme();

  useEffect(() => {
    setStatus(
      session?.status === 'absent' || session?.status === 'cancelled' ? session.status : 'attended',
    );
    setNote(session?.note ?? '');
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (queue.length === 0) setIndex(0);
  }, [queue.length]);

  if (!session?.starts_at) return null;

  function save() {
    mark.mutate(
      { id: session.id, status, note: note.trim() || null },
      {
        onSuccess: () => {
          if (index + 1 < queue.length) {
            setIndex(index + 1);
          } else {
            setIndex(0);
            onClose();
            if (queue.length > 1) snackbar("Register's all caught up. Chai break?");
          }
        },
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );
  }

  const startsAt = session.starts_at;
  return (
    <BottomSheet visible onClose={onClose}>
      <Text weight="semibold" tabular className="text-[20px]">
        {formatTime(startsAt, tutorZone)} · {session.student.name}
      </Text>
      <Text tabular className="mt-1 text-[13px] text-muted">
        {DateTime.fromISO(startsAt).setZone(tutorZone).toFormat('ccc d LLL')} ·{' '}
        {formatStudentLocal(startsAt, session.student.timezone, session.student.city)}
        {queue.length > 1 ? `  ·  ${index + 1} of ${queue.length}` : ''}
      </Text>

      <View className="mt-5 gap-2">
        {OPTIONS.map((o) => (
          <OptionRow
            key={o.status}
            icon={o.icon}
            iconColor={o.iconColor}
            label={o.label}
            tone={o.tone}
            selected={status === o.status}
            onPress={() => setStatus(o.status)}
          />
        ))}
      </View>

      <TextInput
        value={note}
        onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
        placeholder="Add a short note (optional)"
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        multiline
        maxLength={NOTE_MAX}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical="top"
        className={`mt-4 min-h-[72px] rounded-lg bg-surface px-[14px] py-3 font-sans text-[15px] text-text ${focused ? 'border-2 border-primary' : 'border border-border'}`}
      />
      <Text tabular className="mt-1 self-end text-[12px] text-muted">
        {note.length} / {NOTE_MAX}
      </Text>

      <Button label="Save" onPress={save} loading={mark.isPending} className="mt-3" />
    </BottomSheet>
  );
}
