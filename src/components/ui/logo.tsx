import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** Brass bell on teal tile (design 1a). */
export function LogoIcon({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect width={48} height={48} rx={12} fill="#1E5F74" />
      <Bell color="#E9A23B" />
    </Svg>
  );
}

/** Just the bell — used for the reminder accent and empty states. */
export function BellMark({ size = 24, color = '#E9A23B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="8 7 32 34">
      <Bell color={color} />
    </Svg>
  );
}

function Bell({ color }: { color: string }) {
  return (
    <>
      <Circle cx={24} cy={11} r={2.2} fill={color} />
      <Path
        d="M24 12.5c-6.2 0-10.5 4.8-10.5 11v5.5l-3 4.5h27l-3-4.5v-5.5c0-6.2-4.3-11-10.5-11z"
        fill={color}
      />
      <Circle cx={24} cy={37} r={3} fill={color} />
    </>
  );
}
