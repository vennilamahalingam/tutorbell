import { View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { OptionRow } from '@/components/ui/option-row';
import { Text } from '@/components/ui/text';
import { formatStudentLocal, formatTime } from '@/lib/time';
import type { SessionWithStudent } from '../api';

/** Tap a class card → Send reminder on WhatsApp / Mark attendance / Reschedule. */
export function ClassActionsSheet({
  session,
  tutorZone,
  onClose,
  onRemind,
  onMark,
  onReschedule,
}: {
  session: SessionWithStudent | null;
  tutorZone: string;
  onClose: () => void;
  onRemind: () => void;
  onMark: () => void;
  onReschedule: () => void;
}) {
  if (!session?.starts_at) return null;
  return (
    <BottomSheet visible onClose={onClose}>
      <Text weight="semibold" tabular className="text-[20px]">
        {formatTime(session.starts_at, tutorZone)} · {session.student.name}
      </Text>
      <Text tabular className="mt-1 text-[13px] text-muted">
        {formatStudentLocal(session.starts_at, session.student.timezone, session.student.city)}
      </Text>
      <View className="mt-4 gap-1">
        <OptionRow
          bordered={false}
          icon="notifications"
          iconColor="brass"
          label="Send reminder on WhatsApp"
          onPress={onRemind}
        />
        <OptionRow bordered={false} icon="how_to_reg" label="Mark attendance" onPress={onMark} />
        <OptionRow bordered={false} icon="event_repeat" label="Reschedule" onPress={onReschedule} />
      </View>
    </BottomSheet>
  );
}
