import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { CityPicker, useTimePicker } from '@/components/pickers/pickers';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DayChips } from '@/components/ui/day-chips';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-paths';
import { BellMark } from '@/components/ui/logo';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { SelectField } from '@/components/ui/select-field';
import { useSnackbar } from '@/components/ui/snackbar';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { FieldLabel } from '@/components/ui/text-field';
import { useAuth } from '@/features/auth/auth-provider';
import { signOut } from '@/features/auth/google-sign-in';
import { useProfile, useUpdateProfile } from '@/features/auth/profile';
import { DEFAULT_TEMPLATE } from '@/features/reminders/whatsapp';
import {
  describeBlockedTime,
  useAddBlockedTime,
  useBlockedTimes,
  useDeleteBlockedTime,
} from '@/features/settings/blocked-times';
import { cityFromZone } from '@/lib/places';
import {
  dateFromWallTime,
  formatWallTime,
  wallTimeFromDate,
  zoneLabels,
  type WallTime,
} from '@/lib/time';
import { useTheme } from '@/theme/theme-provider';
import type { ThemePreference } from '@/types/database';

/** 2i — Settings. Grouped white cards, 60dp rows. */
export default function SettingsScreen() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { data: blocked = [] } = useBlockedTimes();
  const snackbar = useSnackbar();
  const [sheet, setSheet] = useState<'city' | 'blocked' | 'message' | null>(null);

  if (!profile) return <Screen>{null}</Screen>;

  const tzCity = profile.city ?? cityFromZone(profile.timezone).city;
  const blockedValue =
    blocked.length === 0
      ? 'None'
      : blocked.length === 1
        ? describeBlockedTime(blocked[0])
        : `${blocked.length} blocks`;

  return (
    <Screen>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
        <Card flush>
          <Row
            icon="public"
            title="Your timezone"
            value={`${tzCity} · ${zoneLabels(profile.timezone).abbr}`}
            onPress={() => setSheet('city')}
          />
          <Divider />
          <Row
            icon="block"
            title="Blocked time"
            value={blockedValue}
            onPress={() => setSheet('blocked')}
          />
          <Divider />
          <Row
            icon="calendar_month"
            title="Google Calendar sync"
            value="Coming soon"
            trailing={
              <Switch
                value={false}
                onChange={() => snackbar('Calendar sync is coming in a later update.')}
              />
            }
          />
        </Card>

        <Card onPress={() => setSheet('message')}>
          <View className="flex-row items-center gap-3">
            <BellMark size={22} />
            <Text className="flex-1 text-[15px]">Reminder message</Text>
            <Icon name="edit" size={20} color="muted" />
          </View>
          <View className="mt-3 self-start rounded-lg rounded-bl-[4px] bg-whatsapp px-3 py-2">
            <TemplatePreview template={profile.reminder_template} />
          </View>
          <Text className="mt-2 text-[12px] text-muted">
            {'{time} is filled in with the student’s local time.'}
          </Text>
        </Card>

        <Card>
          <View className="mb-3 flex-row items-center gap-3">
            <Icon name="dark_mode" color="primary" />
            <Text className="text-[15px]">Theme</Text>
          </View>
          <Segmented<ThemePreference>
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={profile.theme}
            onChange={(theme) => update.mutate({ theme })}
          />
        </Card>

        <View className="mt-2 items-center gap-3">
          <Text className="text-[12px] text-muted">Signed in as {session?.user.email}</Text>
          <Pressable onPress={signOut} hitSlop={8} accessibilityRole="button">
            <Text weight="semibold" className="text-[13px] text-primary">
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <CityPicker
        visible={sheet === 'city'}
        selected={cityFromZone(profile.timezone)}
        onClose={() => setSheet(null)}
        onPick={(c) => {
          setSheet(null);
          update.mutate(
            { timezone: c.tz, city: c.city },
            { onSuccess: () => snackbar(`Times now shown in ${c.city} time.`) },
          );
        }}
      />
      {sheet === 'blocked' ? <BlockedTimeSheet onClose={() => setSheet(null)} /> : null}
      {sheet === 'message' ? (
        <ReminderMessageSheet
          initial={profile.reminder_template}
          saving={update.isPending}
          onClose={() => setSheet(null)}
          onSave={(reminder_template) =>
            update.mutate(
              { reminder_template },
              {
                onSuccess: () => {
                  setSheet(null);
                  snackbar('Reminder message saved.');
                },
                onError: (e) => Alert.alert("Couldn't save", e.message),
              },
            )
          }
        />
      ) : null}
    </Screen>
  );
}

function Row({
  icon,
  title,
  value,
  onPress,
  trailing,
}: {
  icon: IconName;
  title: string;
  value: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="min-h-[60px] flex-row items-center gap-3 px-4 py-2 active:bg-secondary-pressed"
    >
      <Icon name={icon} size={22} color="primary" />
      <View className="flex-1">
        <Text className="text-[15px]">{title}</Text>
        <Text tabular className="text-[13px] text-muted" numberOfLines={1}>
          {value}
        </Text>
      </View>
      {trailing ?? <Icon name="chevron_right" size={20} color="muted" />}
    </Pressable>
  );
}

const Divider = () => <View className="ml-[52px] h-px bg-divider" />;

/** WhatsApp-style bubble with {time} highlighted teal 600. */
function TemplatePreview({ template }: { template: string }) {
  const parts = template.split('{time}');
  return (
    <Text className="text-[14px]">
      {parts.map((p, i) => (
        <Text key={i}>
          {p}
          {i < parts.length - 1 ? (
            <Text weight="semibold" className="text-primary">
              {'{time}'}
            </Text>
          ) : null}
        </Text>
      ))}
    </Text>
  );
}

function ReminderMessageSheet({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial: string;
  saving: boolean;
  onSave: (t: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initial);
  const { colors } = useTheme();
  const missing = !text.includes('{time}');
  return (
    <BottomSheet visible onClose={onClose}>
      <Text weight="semibold" className="text-[20px]">
        Reminder message
      </Text>
      <Text className="mt-1 text-[13px] text-muted">
        {'Keep {time} where the class time should go.'}
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        maxLength={300}
        textAlignVertical="top"
        selectionColor={colors.primary}
        className="mt-4 min-h-[96px] rounded-lg border-2 border-primary bg-surface px-[14px] py-3 font-sans text-[15px] text-text"
      />
      {missing ? (
        <Text className="mt-2 text-[13px] text-error-fg">
          {'Add {time} so students see when class is.'}
        </Text>
      ) : null}
      <View className="mt-4 flex-row gap-3">
        <Button
          label="Reset"
          variant="secondary"
          onPress={() => setText(DEFAULT_TEMPLATE)}
          className="flex-1"
        />
        <Button
          label="Save"
          onPress={() => onSave(text.trim())}
          disabled={missing || !text.trim()}
          loading={saving}
          className="flex-1"
        />
      </View>
    </BottomSheet>
  );
}

function BlockedTimeSheet({ onClose }: { onClose: () => void }) {
  const { data: blocked = [] } = useBlockedTimes();
  const add = useAddBlockedTime();
  const del = useDeleteBlockedTime();
  const openTime = useTimePicker();
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [from, setFrom] = useState<WallTime>({ hour: 13, minute: 0 });
  const [to, setTo] = useState<WallTime>({ hour: 14, minute: 30 });

  const toMin = (t: WallTime) => t.hour * 60 + t.minute;
  const hhmm = (t: WallTime) =>
    `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
  const invalid = days.length === 0 || toMin(to) <= toMin(from);

  return (
    <BottomSheet visible onClose={onClose}>
      <Text weight="semibold" className="text-[20px]">
        Blocked time
      </Text>
      <Text className="mt-1 text-[13px] text-muted">
        Your time. Reschedule warns you if a class lands here.
      </Text>

      {blocked.length > 0 ? (
        <View className="mt-4 rounded-xl border border-border">
          {blocked.map((b, i) => (
            <View
              key={b.id}
              className={`flex-row items-center px-4 py-3 ${i ? 'border-t border-divider' : ''}`}
            >
              <Text tabular className="flex-1 text-[15px]">
                {describeBlockedTime(b)}
              </Text>
              <Pressable
                onPress={() => del.mutate(b.id)}
                hitSlop={8}
                accessibilityLabel="Remove blocked time"
              >
                <Icon name="delete" size={20} color="muted" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-5 gap-3">
        <FieldLabel>Add a block</FieldLabel>
        <DayChips value={days} onChange={setDays} />
        <View className="flex-row gap-2">
          <SelectField
            label="From"
            value={formatWallTime(from)}
            onPress={() => openTime(dateFromWallTime(from), (d) => setFrom(wallTimeFromDate(d)))}
            className="flex-1"
          />
          <SelectField
            label="To"
            value={formatWallTime(to)}
            onPress={() => openTime(dateFromWallTime(to), (d) => setTo(wallTimeFromDate(d)))}
            className="flex-1"
          />
        </View>
        {toMin(to) <= toMin(from) ? (
          <Text className="text-[13px] text-error-fg">End time should be after start time.</Text>
        ) : null}
        <Button
          label="Add blocked time"
          onPress={() => add.mutate({ weekdays: days, starts: hhmm(from), ends: hhmm(to) })}
          disabled={invalid}
          loading={add.isPending}
        />
      </View>
    </BottomSheet>
  );
}
