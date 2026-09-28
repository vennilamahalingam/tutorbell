import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { signOut } from '@/features/auth/google-sign-in';
import { useTutorZone } from '@/features/auth/profile';

export default function SettingsScreen() {
  const { session } = useAuth();
  const zone = useTutorZone();

  return (
    <Screen>
      <Text className="mb-4 text-2xl font-bold text-ink">Settings</Text>
      <View className="gap-1 rounded-2xl bg-surface p-4">
        <Text className="text-ink">{session?.user.email}</Text>
        <Text className="text-sm text-ink-muted">Your timezone: {zone}</Text>
      </View>
      <View className="mt-auto pb-4">
        <Button label="Sign out" variant="secondary" onPress={signOut} />
      </View>
    </Screen>
  );
}
