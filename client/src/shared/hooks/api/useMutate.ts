import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useApi } from "./useApi";

interface Props<TData, TVariables> {
  url: (string | number)[];
  method?: "post" | "put" | "patch";
  invalidateKeys?: unknown[][];
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
}

export function useMutate<TData = unknown, TVariables = unknown>({
  url,
  method = "post",
  invalidateKeys = [],
  options,
}: Props<TData, TVariables>) {
  const api = useApi(url);
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => api.mutate<TData>(variables, method),
    onSuccess: (...args) => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
