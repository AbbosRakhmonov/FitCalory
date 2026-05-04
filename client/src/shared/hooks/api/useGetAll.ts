import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useApi } from "./useApi";

interface Props<T> {
  url: (string | number)[];
  queryKey: readonly unknown[];
  params?: Record<string, unknown>;
  options?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn">;
}

export function useGetAll<T>({ url, queryKey, params, options }: Props<T>) {
  const api = useApi(url);
  return useQuery<T[]>({
    queryKey,
    queryFn: () => api.get<T[]>(params),
    ...options,
  });
}
