"use client";

import { useCallback, useEffect, useState } from "react";

import { useSession } from "./session";

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  reload: () => void;
}

/**
 * Loads admin data and re-runs whenever `key` changes. Failures are reported
 * through the session (redirect on 401, toast otherwise).
 */
export function useAdminQuery<T>(key: string, fetcher: () => Promise<T>): QueryState<T> {
  const { reportError } = useSession();
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Loading starts synchronously so the UI never shows stale data as current.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) reportError(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` is recreated on every render; `key` identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version, reportError]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { data, loading, reload };
}
