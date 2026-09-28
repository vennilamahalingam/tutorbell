import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

/**
 * Google sign-in via Supabase OAuth (PKCE) in an in-app browser.
 * Add the redirect URL (tutorbell://auth/callback, plus the exp:// URL printed in dev)
 * to Supabase → Authentication → URL Configuration → Redirect URLs.
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return; // user closed the browser

  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new Error('No auth code returned from Google sign-in.');

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}

export const signOut = () => supabase.auth.signOut();
