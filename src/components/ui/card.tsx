import { Pressable, View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  className?: string;
  /** Dashed border — used for "To reschedule" cards. */
  dashed?: boolean;
  /** Tighter list-row padding (14×16dp). */
  row?: boolean;
  onPress?: () => void;
};

/** White card, 1dp warm hairline, radius 14dp, no shadow. */
export function Card({ className = '', dashed, row, onPress, ...props }: Props) {
  const cls = `rounded-xl border bg-surface ${dashed ? 'border-dashed border-dash' : 'border-border'} ${row ? 'px-4 py-[14px]' : 'p-4'} ${className}`;
  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${cls} active:bg-secondary-pressed`}>
        {props.children}
      </Pressable>
    );
  }
  return <View className={cls} {...props} />;
}
