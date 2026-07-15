import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/config";

type UseFetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// path === null salta el fetch (ej. mientras no hay filtros aplicados aún)
export function useFetch<T>(path: string | null, options?: RequestInit) {
  const { token } = useAuth();
  console.log({ token });
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: !!path,
    error: null,
  });
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        ...optionsRef.current,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...optionsRef.current?.headers,
        },
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = (await res.json()) as T;
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }, [path, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
