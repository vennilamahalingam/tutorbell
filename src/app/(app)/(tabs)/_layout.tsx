import { Tabs } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon-paths';
import { Text } from '@/components/ui/text';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Today', icon: 'today' },
  students: { label: 'Students', icon: 'group' },
  settings: { label: 'Settings', icon: 'settings' },
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="students" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

/**
 * Bottom navigation (design "Global layout"): 72dp, surface, 1dp top border.
 * Active: icon in a 4×18dp pill (primary-container), label 600.
 */
function BottomNav({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="flex-row border-t border-border bg-surface"
    >
      {state.routes.map((route: { key: string; name: string }, i: number) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              const e = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            className="h-[72px] flex-1 items-center justify-center gap-1"
          >
            <View className={`rounded-full px-[18px] py-1 ${active ? 'bg-primary-container' : ''}`}>
              <Icon name={tab.icon} size={22} color={active ? 'on-primary-container' : 'muted'} />
            </View>
            <Text
              weight={active ? 'semibold' : 'regular'}
              className={`text-[12px] ${active ? 'text-on-primary-container' : 'text-muted'}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
