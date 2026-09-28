import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { signInWithGoogle } from '@/features/auth/google-sign-in';

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);

  async function onPress() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('Sign-in failed', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 justify-center gap-3">
        <Text className="text-4xl font-bold text-ink">Tutorbell</Text>
        <Text className="text-base text-ink-muted">
          Classes, reminders and reschedules — sorted.
        </Text>
      </View>
      <View className="pb-10">
        <Button label="Continue with Google" onPress={onPress} loading={loading} />
      </View>
    </Screen>
  );
}
