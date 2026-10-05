import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import { Platform, Pressable, Text, View } from 'react-native';

type Props = { label: string; value: Date; onChange: (date: Date) => void };

/** Date + time picker. Android opens the native date dialog, then the time dialog. */
export function DateTimeField({ label, value, onChange }: Props) {
  if (Platform.OS === 'ios') {
    return (
      <View className="gap-1">
        <Text className="text-sm font-medium text-ink-muted">{label}</Text>
        <DateTimePicker
          value={value}
          mode="datetime"
          minuteInterval={5}
          onChange={(_e, d) => d && onChange(d)}
        />
      </View>
    );
  }

  function openPicker() {
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          onChange: (e, time) => {
            if (e.type === 'set' && time) onChange(time);
          },
        });
      },
    });
  }

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-ink-muted">{label}</Text>
      <Pressable onPress={openPicker} className="rounded-xl bg-surface px-4 py-3 active:opacity-80">
        <Text className="text-ink">
          {DateTime.fromJSDate(value).toFormat('ccc d LLL yyyy, h:mm a')}
        </Text>
      </Pressable>
    </View>
  );
}
