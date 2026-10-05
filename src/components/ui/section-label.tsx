import { Text } from './text';

export function SectionLabel({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return (
    <Text
      weight="semibold"
      className={`px-1 text-[12px] uppercase text-muted ${className}`}
      style={{ letterSpacing: 0.6 }}
    >
      {children}
    </Text>
  );
}
