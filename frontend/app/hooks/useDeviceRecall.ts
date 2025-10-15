// app/hooks/useDeviceRecall.ts
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as AppIntegrity from '@expo/app-integrity';
import * as Crypto from 'expo-crypto';
import * as Application from 'expo-application';

type RecallBits = {
  bitFirst?: boolean;   // claimed high-value reward
  bitSecond?: boolean;  // manual abuse flag
  bitThird?: boolean;   // cooldown active
};

type RecallMetadata = {
  writeMonth: number;
  writeYear: number;
};

type RecallData = {
  bits: Required<RecallBits>;
  metadata: RecallMetadata;
};

type RecallArtifacts = {
  nonce: string;
  integrity_token: string | null; // null on iOS or if Play Integrity unavailable
  token_hash: string | null;      // null if token is null
  recall_data: RecallData;
};

type Action = 'account_create' | 'claim_reward';

type Options = {
  // override bits if you want a custom write on the server
  bitsOverride?: Partial<RecallBits>;
  // usually leave undefined -> we’ll fill current month/year
  metadataOverride?: Partial<RecallMetadata>;
  // provide if your account-create endpoint isn’t the rewards one
  endpointOverride?: string;
  // extra body fields to merge when using helper submitters
  extraBody?: Record<string, unknown>;
};

const API_BASE = process.env.EXPO_PUBLIC_FOC_ENGINE_API ?? '';
const PKG_FALLBACK = 'com.starknet.pow'; // only used if Application.applicationId is undefined

function nowMetadata(): RecallMetadata {
  const now = new Date();
  return { writeMonth: now.getMonth() + 1, writeYear: now.getFullYear() };
}

async function sha256Hex(input: string) {
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
  return hash.toLowerCase();
}

async function fetchJSON<T>(url: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await res.text();
    let json: any = {};
    try { json = text ? JSON.parse(text) : {}; } catch {
      throw new Error(`Non-JSON response (${res.status})`);
    }
    if (!res.ok) {
      const msg = json?.message || json?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json as T;
  } finally {
    clearTimeout(t);
  }
}

export function useDeviceRecall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // resolve Android package name for Play Integrity + backend
  const packageName = useMemo(() => {
    const pkg = Application.applicationId ?? PKG_FALLBACK;
    return pkg;
  }, []);

  // builds default bit intents per action
  const defaultBitsFor = useCallback((action: Action): Required<RecallBits> => {
    switch (action) {
      case 'claim_reward':
        // flip "claimed" bit on server after successful claim
        return { bitFirst: true, bitSecond: false, bitThird: false };
      case 'account_create':
      default:
        // no write by default — server can still read bits as context
        return { bitFirst: false, bitSecond: false, bitThird: false };
    }
  }, []);

  // 1) ask backend for a nonce
  const getNonce = useCallback(async (userId: string) => {
    type NonceRes = { nonce: string };
    return fetchJSON<NonceRes>(`${API_BASE}/api/rewards/generate-nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, package_name: packageName }),
    });
  }, [packageName]);

  // 2) request Play Integrity token (Android only)
  const getPlayIntegrityToken = useCallback(async (nonce: string) => {
    if (Platform.OS !== 'android') return null;
    try {
      // Will throw if Play services not available or app not Play-installed (common in dev)
      const token = await AppIntegrity.requestIntegrityCheck(nonce);
      return token ?? null;
    } catch {
      // In dev/sideloads this can fail—return null so backend can soft-handle
      return null;
    }
  }, []);

  // Public: prepare artifacts to attach to *your* requests (account create, claim, etc.)
  const prepareRecallArtifacts = useCallback(
    async (userId: string, action: Action, opts?: Options): Promise<RecallArtifacts> => {
      setLoading(true);
      setError(null);
      try {
        const { nonce } = await getNonce(userId);

        const token = await getPlayIntegrityToken(nonce);
        const token_hash = token ? await sha256Hex(token) : null;

        const bits = { ...defaultBitsFor(action), ...(opts?.bitsOverride ?? {}) };
        const metadata = { ...nowMetadata(), ...(opts?.metadataOverride ?? {}) } as RecallMetadata;

        return {
          nonce,
          integrity_token: token,
          token_hash,
          recall_data: { bits, metadata },
        };
      } catch (e: any) {
        const msg = e?.message ?? 'Failed to prepare Device Recall artifacts';
        if (isMounted.current) setError(msg);
        throw new Error(msg);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [defaultBitsFor, getNonce, getPlayIntegrityToken]
  );

  // Helper: submit to your **reward claim** endpoint with recall artifacts
  const submitClaimWithRecall = useCallback(
    async (params: {
      userId: string;
      integritySummary?: string;     // optional client summary
      deviceFingerprint?: string | null;
      // if your claim endpoint needs extra fields, pass them via opts.extraBody
      opts?: Options;
    }) => {
      const { userId, integritySummary, deviceFingerprint = null, opts } = params;
      const arts = await prepareRecallArtifacts(userId, 'claim_reward', opts);

      const body = {
        nonce: arts.nonce,
        user_id: userId,
        integrity_summary: integritySummary ?? null,
        integrity_token: arts.integrity_token,
        token_hash: arts.token_hash,
        device_fingerprint: deviceFingerprint,
        recall_data: arts.recall_data,
        ...(opts?.extraBody ?? {}),
      };

      type ClaimRes = { success?: boolean; message?: string; error?: string };
      const res = await fetchJSON<ClaimRes>(`${API_BASE}/api/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      return { artifacts: arts, response: res };
    },
    [prepareRecallArtifacts]
  );

  // Helper: for **account creation** flows — returns artifacts or optionally submits
  const getAccountCreateRecallArtifacts = useCallback(
    async (userId: string, opts?: Options) => {
      // by default we DO NOT request a write on account create, but you can override bits
      return prepareRecallArtifacts(userId, 'account_create', opts);
    },
    [prepareRecallArtifacts]
  );

  // OPTIONAL convenience: submit account creation if you have a specific endpoint
  const submitAccountCreateWithRecall = useCallback(
    async (params: {
      userId: string;
      endpoint?: string; // default below
      body?: Record<string, unknown>; // your account payload (email, handle, etc.)
      opts?: Options;
    }) => {
      const endpoint = params.endpoint ?? `${API_BASE}/api/accounts/create`;
      const arts = await prepareRecallArtifacts(params.userId, 'account_create', params.opts);

      const merged = {
        ...(params.body ?? {}),
        user_id: params.userId,
        integrity_token: arts.integrity_token,
        token_hash: arts.token_hash,
        recall_data: arts.recall_data,
      };

      const res = await fetchJSON<any>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });

      return { artifacts: arts, response: res };
    },
    [prepareRecallArtifacts]
  );

  return {
    // state
    loading,
    error,
    // building blocks
    prepareRecallArtifacts,
    getAccountCreateRecallArtifacts,
    // helpers
    submitClaimWithRecall,
    submitAccountCreateWithRecall,
  };
}
