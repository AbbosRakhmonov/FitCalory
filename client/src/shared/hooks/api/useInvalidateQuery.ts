import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateQuery() {
  const queryClient = useQueryClient();
  return (...keys: unknown[][]) => {
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
  };
}
