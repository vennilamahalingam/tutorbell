import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// Refetch stale queries when the app returns to the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    focusManager.setFocused(state === 'active');
  });
}
