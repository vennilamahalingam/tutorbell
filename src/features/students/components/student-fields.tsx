import { useState } from 'react';
import { View } from 'react-native';

import { CityPicker, CountryCodePicker } from '@/components/pickers/pickers';
import { Icon } from '@/components/ui/icon';
import { SelectField } from '@/components/ui/select-field';
import { Text } from '@/components/ui/text';
import { FieldLabel, TextField } from '@/components/ui/text-field';
import { countryByName, type City, type Country } from '@/lib/places';
import { nowIn, offsetFromTutor, zoneShort } from '@/lib/time';
import { useNow } from '@/lib/use-now';

export type StudentBasics = { name: string; dial: Country; phone: string; city: City | null };

/** Name · WhatsApp (+code) · City (sets timezone) — shared by onboarding (2k) and Add student (2h). */
export function StudentFields({
  value,
  onChange,
  tutorZone,
  cityLabel = 'City (sets timezone)',
  showLiveTime = true,
  showErrors,
}: {
  value: StudentBasics;
  onChange: (v: StudentBasics) => void;
  tutorZone: string;
  cityLabel?: string;
  showLiveTime?: boolean;
  showErrors?: boolean;
}) {
  const [picker, setPicker] = useState<'city' | 'dial' | null>(null);
  const set = (patch: Partial<StudentBasics>) => onChange({ ...value, ...patch });
  useNow();

  const firstName = value.name.trim().split(/\s+/)[0];

  return (
    <View className="gap-4">
      <View>
        <TextField
          label="Name"
          value={value.name}
          onChangeText={(name) => set({ name })}
          placeholder="Emma Clarke"
          autoCapitalize="words"
          returnKeyType="next"
        />
        {showErrors && !value.name.trim() ? <FieldError>Add a name.</FieldError> : null}
      </View>

      <View className="gap-1.5">
        <FieldLabel>WhatsApp number</FieldLabel>
        <View className="flex-row gap-2">
          <SelectField
            value={value.dial.dial}
            onPress={() => setPicker('dial')}
            trailing={<Icon name="expand_more" size={20} color="muted" />}
            className="w-[104px]"
          />
          <TextField
            value={value.phone}
            onChangeText={(phone) => set({ phone: phone.replace(/[^\d\s]/g, '') })}
            placeholder="412 555 019"
            keyboardType="phone-pad"
            className="flex-1"
          />
        </View>
      </View>

      <View>
        <SelectField
          label={cityLabel}
          value={
            value.city
              ? value.city.country
                ? `${value.city.city}, ${value.city.country}`
                : value.city.city
              : ''
          }
          placeholder="Search city"
          onPress={() => setPicker('city')}
          trailing={
            value.city ? (
              <Text tabular className="text-[12px] text-muted">
                {zoneShort(value.city.tz)}
              </Text>
            ) : (
              <Icon name="search" size={20} color="muted" />
            )
          }
        />
        {showErrors && !value.city ? (
          <FieldError>Pick where they live — it sets their timezone.</FieldError>
        ) : null}
      </View>

      {showLiveTime && value.city ? (
        <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-4">
          <Text className="text-[14px] text-muted">
            {firstName ? `${firstName}'s time now` : 'Their time now'}
          </Text>
          <View className="items-end">
            <Text weight="semibold" tabular className="text-[20px]">
              {nowIn(value.city.tz).time}
            </Text>
            <Text tabular className="text-[12px] text-muted">
              {nowIn(value.city.tz).day} · {offsetFromTutor(value.city.tz, tutorZone)}
            </Text>
          </View>
        </View>
      ) : null}

      <CityPicker
        visible={picker === 'city'}
        selected={value.city}
        onClose={() => setPicker(null)}
        onPick={(city) => {
          // Picking a city also suggests that country's WhatsApp code, if the number is still empty.
          const country = countryByName(city.country);
          set({ city, ...(country && !value.phone ? { dial: country } : {}) });
          setPicker(null);
        }}
      />
      <CountryCodePicker
        visible={picker === 'dial'}
        selected={value.dial}
        onClose={() => setPicker(null)}
        onPick={(dial) => {
          set({ dial });
          setPicker(null);
        }}
      />
    </View>
  );
}

function FieldError({ children }: { children: string }) {
  return <Text className="mt-1.5 text-[13px] text-error-fg">{children}</Text>;
}

/** "+44" + "7700 900123" → "+447700900123" (E.164), or null if empty. */
export function toE164(dial: Country, phone: string): string | null {
  const digits = phone.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `${dial.dial}${digits}` : null;
}
