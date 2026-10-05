import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { CityPicker } from '@/components/pickers/pickers';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-paths';
import { Text } from '@/components/ui/text';
import { useUpdateProfile } from '@/features/auth/profile';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import { cityFromZone, type City } from '@/lib/places';
import { deviceZone, nowIn, zoneLabels } from '@/lib/time';
import { useNow } from '@/lib/use-now';

/** 2b — Step 1: confirm the tutor's timezone. */
export default function TimezoneStep() {
  const { draft, update } = useOnboarding();
  const [picking, setPicking] = useState(false);
  const updateProfile = useUpdateProfile();
  useNow();

  const detected = cityFromZone(deviceZone());
  const chosen = draft.tutorCity;
  const isDetected = chosen.tz === detected.tz && chosen.city === detected.city;

  function next() {
    updateProfile.mutate(
      { timezone: chosen.tz, city: chosen.city },
      {
        onSuccess: () => router.push('/student'),
        onError: (e) => Alert.alert("Couldn't save", e.message),
      },
    );
  }

  return (
    <OnboardingStep
      step={1}
      title="Where do you teach from?"
      body="We'll show every class in your time first, with your student's time beside it."
      footer={<Button label="Looks right" onPress={next} loading={updateProfile.isPending} />}
    >
      <ZoneOption
        city={detected}
        icon="my_location"
        detected
        selected={isDetected}
        onPress={() => update({ tutorCity: detected })}
      />
      {!isDetected ? (
        <ZoneOption city={chosen} icon="public" selected onPress={() => setPicking(true)} />
      ) : null}

      <Pressable
        onPress={() => setPicking(true)}
        className="h-[52px] flex-row items-center gap-3 rounded-xl border border-border bg-surface px-4 active:bg-secondary-pressed"
      >
        <Icon name="search" size={20} color="primary" />
        <Text weight="semibold" className="flex-1 text-[15px] text-primary">
          Choose another city
        </Text>
        <Icon name="chevron_right" size={20} color="muted" />
      </Pressable>

      <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-4">
        <Text className="text-[14px] text-muted">Your time now</Text>
        <Text weight="semibold" tabular className="text-[20px]">
          {nowIn(chosen.tz).time}
        </Text>
      </View>

      <CityPicker
        visible={picking}
        selected={chosen}
        onClose={() => setPicking(false)}
        onPick={(c: City) => {
          update({ tutorCity: c });
          setPicking(false);
        }}
      />
    </OnboardingStep>
  );
}

function ZoneOption({
  city,
  icon,
  detected,
  selected,
  onPress,
}: {
  city: City;
  icon: IconName;
  detected?: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const { abbr, offset } = zoneLabels(city.tz);
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-3 rounded-xl bg-surface p-4 ${selected ? 'border-2 border-primary' : 'border border-border'}`}
    >
      <Icon name={icon} size={22} color="primary" />
      <View className="flex-1">
        <Text weight="semibold" className="text-[15px]">
          {city.country ? `${city.country} · ${city.city}` : city.city}
        </Text>
        <Text tabular className="mt-0.5 text-[13px] text-muted">
          {[abbr, offset, detected ? 'detected' : null].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {selected ? <Icon name="check_circle" size={22} color="primary" /> : null}
    </Pressable>
  );
}
