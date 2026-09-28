import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center rounded-xl px-4 py-3 active:opacity-80 ${
        isPrimary ? 'bg-brand' : 'bg-brand-soft'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : undefined} />
      ) : (
        <Text className={`font-semibold ${isPrimary ? 'text-white' : 'text-brand'}`}>{label}</Text>
      )}
    </Pressable>
  );
}
