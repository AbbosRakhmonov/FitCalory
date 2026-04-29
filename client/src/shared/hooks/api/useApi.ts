import request from "@/request";

type Url = string | number;

export function useApi(segments: Url[]) {
  const path = segments.join("/");

  async function get<T>(params?: Record<string, unknown>): Promise<T> {
    const { data } = await request.get<{ data: T }>(path, { params });
    return data.data;
  }

  async function mutate<T>(body: unknown, method: "post" | "put" | "patch" = "post"): Promise<T> {
    const { data } = await request[method]<{ data: T }>(path, body);
    return data.data;
  }

  async function remove<T>(): Promise<T> {
    const { data } = await request.delete<{ data: T }>(path);
    return data.data;
  }

  return { get, mutate, remove };
}
