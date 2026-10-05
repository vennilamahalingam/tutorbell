import { vars } from 'nativewind';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme, View } from 'react-native';

import { dark, light } from './colors';

export type ThemePreference = 'system' | 'light' | 'dark';
type Palette = typeof light;

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const toVars = (p: Palette) =>
  vars(Object.fromEntries(Object.entries(p).map(([k, v]) => [`--c-${k}`, toRgb(v)])));

const lightVars = toVars(light);
const darkVars = toVars(dark);

type Theme = { isDark: boolean; colors: Palette };
const ThemeContext = createContext<Theme>({ isDark: false, colors: light });

/** Applies light/dark tokens as CSS variables to everything below it. */
export function ThemeProvider({
  preference = 'system',
  children,
}: PropsWithChildren<{ preference?: ThemePreference }>) {
  const system = useColorScheme();
  const isDark = preference === 'system' ? system === 'dark' : preference === 'dark';
  const value = useMemo(() => ({ isDark, colors: isDark ? dark : light }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, isDark ? darkVars : lightVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

/** For things classes can't reach: SVG fills, native props (placeholderTextColor, Switch…). */
export const useTheme = () => useContext(ThemeContext);

/** Re-apply theme vars inside portals/modals that render outside the root view. */
export function ThemeScope({ children }: PropsWithChildren) {
  const { isDark } = useTheme();
  return <View style={[{ flex: 1 }, isDark ? darkVars : lightVars]}>{children}</View>;
}
