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
  await exchangeCodeOnce(code);
}

const exchanges = new Map<string, Promise<void>>();

/**
 * Swap the one-time code for a session. The same code can arrive twice — from the
 * in-app browser result above AND as a deep link to /auth/callback — so share one attempt.
 */
export function exchangeCodeOnce(code: string): Promise<void> {
  let p = exchanges.get(code);
  if (!p) {
    p = supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) throw error;
    });
    exchanges.set(code, p);
  }
  return p;
}

export const signOut = () => supabase.auth.signOut();
