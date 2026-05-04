import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import request from "@/request";

interface Props {
  urlFn: (id: string) => string;
  invalidateKeys?: readonly (readonly unknown[])[];
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">;
}

export function useDelete({ urlFn, invalidateKeys = [], options }: Props) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => request.delete(urlFn(id)).then(() => undefined),
    onSuccess: (...args) => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
