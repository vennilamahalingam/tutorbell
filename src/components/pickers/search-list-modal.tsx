import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { TopBar } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { ThemeScope } from '@/theme/theme-provider';

type Props<T> = {
  visible: boolean;
  title: string;
  placeholder: string;
  items: T[];
  keyOf: (item: T) => string;
  filter: (item: T, query: string) => boolean;
  label: (item: T) => string;
  subtitle?: (item: T) => string;
  trailing?: (item: T) => string;
  selectedKey?: string;
  onPick: (item: T) => void;
  onClose: () => void;
};

/** Full-screen searchable list (city search, country code). */
export function SearchListModal<T>({
  visible,
  title,
  placeholder,
  items,
  keyOf,
  filter,
  label,
  subtitle,
  trailing,
  selectedKey,
  onPick,
  onClose,
}: Props<T>) {
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => (query.trim() ? items.filter((i) => filter(i, query.trim().toLowerCase())) : items),
    [items, query, filter],
  );

  function close() {
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <ThemeScope>
        <SafeAreaView className="flex-1 bg-bg">
          <TopBar title={title} onClose={close} />
          <View className="px-4 pb-3">
            <TextField
              placeholder={placeholder}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
              trailing={<Icon name="search" size={20} color="muted" />}
            />
          </View>
          <FlatList
            data={results}
            keyExtractor={keyOf}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pb-8"
            ListEmptyComponent={
              <Text className="px-1 py-6 text-[14px] text-muted">
                No match. Try a nearby big city in the same timezone.
              </Text>
            }
            renderItem={({ item }) => {
              const selected = keyOf(item) === selectedKey;
              return (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    onPick(item);
                  }}
                  className="min-h-[56px] flex-row items-center gap-3 border-b border-divider px-1 py-2 active:bg-secondary-pressed"
                >
                  <View className="flex-1">
                    <Text weight={selected ? 'semibold' : 'regular'} className="text-[15px]">
                      {label(item)}
                    </Text>
                    {subtitle ? (
                      <Text className="text-[13px] text-muted">{subtitle(item)}</Text>
                    ) : null}
                  </View>
                  {trailing ? (
                    <Text tabular className="text-[12px] text-muted">
                      {trailing(item)}
                    </Text>
                  ) : null}
                  {selected ? <Icon name="check" size={20} color="primary" /> : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </ThemeScope>
    </Modal>
  );
}
