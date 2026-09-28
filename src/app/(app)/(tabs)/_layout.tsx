import { Tabs } from 'expo-router/js-tabs';

// TODO: add tab icons from the Tutorbell designs.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2F5D50' }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="students" options={{ title: 'Students' }} />
      <Tabs.Screen name="reschedule" options={{ title: 'Reschedule' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
