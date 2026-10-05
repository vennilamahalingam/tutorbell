import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/auth-provider';
import { signOut } from '@/features/auth/google-sign-in';
import { useProfile, useUpdateProfile } from '@/features/auth/profile';
import { zoneLabels } from '@/lib/time';
import type { ThemePreference } from '@/types/database';

/** Settings (2i) — INTERIM: timezone + theme + sign out. Rest comes with the Settings rebuild. */
export default function SettingsScreen() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  return (
    <Screen>
      <ScreenHeader title="Settings" />
      <View className="gap-4 px-4">
        <Card row>
          <View className="flex-row items-center gap-3">
            <Icon name="public" color="primary" />
            <View className="flex-1">
              <Text className="text-[15px]">Your timezone</Text>
              <Text className="text-[13px] text-muted">
                {profile
                  ? `${profile.city ?? profile.timezone} · ${zoneLabels(profile.timezone).abbr}`
                  : ''}
              </Text>
            </View>
          </View>
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
            value={profile?.theme ?? 'system'}
            onChange={(theme) => update.mutate({ theme })}
          />
        </Card>
        <Button label="Sign out" variant="secondary" onPress={signOut} />
        <Text className="text-center text-[12px] text-muted">
          Signed in as {session?.user.email}
        </Text>
      </View>
    </Screen>
  );
}
