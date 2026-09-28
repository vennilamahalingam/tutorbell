import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useCreateStudent } from '@/features/students/queries';
import { deviceZone, isValidZone } from '@/lib/time';

export default function NewStudentScreen() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [timezone, setTimezone] = useState(deviceZone());
  const create = useCreateStudent();

  function save() {
    if (!name.trim()) return Alert.alert('Name is required');
    if (!isValidZone(timezone))
      return Alert.alert('Unknown timezone', 'Use a name like America/New_York');
    create.mutate(
      { name: name.trim(), whatsapp_number: whatsapp.trim() || null, timezone },
      { onSuccess: () => router.back(), onError: (e) => Alert.alert('Could not save', e.message) },
    );
  }

  return (
    <View className="flex-1 gap-4 bg-surface-muted p-4">
      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="WhatsApp number"
        value={whatsapp}
        onChangeText={setWhatsapp}
        placeholder="+14155550123"
        keyboardType="phone-pad"
      />
      {/* TODO: replace with a searchable timezone picker */}
      <Field label="Timezone" value={timezone} onChangeText={setTimezone} autoCapitalize="none" />
      <Button label="Save student" onPress={save} loading={create.isPending} />
    </View>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-ink-muted">{label}</Text>
      <TextInput className="rounded-xl bg-surface px-4 py-3 text-ink" {...props} />
    </View>
  );
}
