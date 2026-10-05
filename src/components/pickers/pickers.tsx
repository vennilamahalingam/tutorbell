import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useCallback } from 'react';

import { cities, countries, type City, type Country } from '@/lib/places';
import { zoneShort } from '@/lib/time';
import { SearchListModal } from './search-list-modal';

const filterCity = (c: City, q: string) =>
  c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
const filterCountry = (c: Country, q: string) =>
  c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase() === q;

/** City search — picking a city sets the timezone. */
export function CityPicker(props: {
  visible: boolean;
  selected?: City | null;
  onPick: (city: City) => void;
  onClose: () => void;
}) {
  return (
    <SearchListModal
      visible={props.visible}
      title="Choose a city"
      placeholder="Search city or country"
      items={cities}
      keyOf={(c) => `${c.city}|${c.tz}`}
      filter={filterCity}
      label={(c) => c.city}
      subtitle={(c) => c.country}
      trailing={(c) => zoneShort(c.tz)}
      selectedKey={props.selected ? `${props.selected.city}|${props.selected.tz}` : undefined}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

export function CountryCodePicker(props: {
  visible: boolean;
  selected?: Country | null;
  onPick: (country: Country) => void;
  onClose: () => void;
}) {
  return (
    <SearchListModal
      visible={props.visible}
      title="Country code"
      placeholder="Search country"
      items={countries}
      keyOf={(c) => c.code}
      filter={filterCountry}
      label={(c) => c.name}
      trailing={(c) => c.dial}
      selectedKey={props.selected?.code}
      onPick={props.onPick}
      onClose={props.onClose}
    />
  );
}

/** Native Android time dialog. */
export function useTimePicker() {
  return useCallback((value: Date, onPick: (d: Date) => void) => {
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      minuteInterval: 5,
      onChange: (e, d) => {
        if (e.type === 'set' && d) onPick(d);
      },
    });
  }, []);
}

/** Native Android date dialog. */
export function useDatePicker() {
  return useCallback((value: Date, onPick: (d: Date) => void, minimumDate?: Date) => {
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      minimumDate,
      onChange: (e, d) => {
        if (e.type === 'set' && d) onPick(d);
      },
    });
  }, []);
}
