import * as ExpoCrypto from 'expo-crypto';

/**
 * Hermes has no WebCrypto. Supabase uses crypto.subtle.digest('SHA-256') for the PKCE
 * code challenge; without it, it falls back to the weaker "plain" method (and warns).
 * Provide the two pieces it needs from expo-crypto. Import before creating the client.
 */
type MutableCrypto = { getRandomValues?: Crypto['getRandomValues']; subtle?: SubtleCrypto };
const g = globalThis as unknown as { crypto?: MutableCrypto };
g.crypto ??= {};

if (typeof g.crypto.getRandomValues !== 'function') {
  g.crypto.getRandomValues = ExpoCrypto.getRandomValues as Crypto['getRandomValues'];
}

if (typeof g.crypto.subtle === 'undefined') {
  g.crypto.subtle = {
    digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      if (name.toUpperCase() !== 'SHA-256') throw new Error(`Unsupported digest: ${name}`);
      return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
    },
  } as SubtleCrypto;
}
