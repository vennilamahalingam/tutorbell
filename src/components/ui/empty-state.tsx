import { Text, View } from 'react-native';

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-lg font-semibold text-ink">{title}</Text>
      {body ? <Text className="mt-2 text-center text-ink-muted">{body}</Text> : null}
    </View>
  );
}
