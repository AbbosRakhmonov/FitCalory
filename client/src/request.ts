import axios from "axios";
import { config } from "@/shared/utils/config";
import { useAuthStore } from "@/shared/store/useAuthStore";

const request = axios.create({ baseURL: config.apiUrl });

request.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

request.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
      try {
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return request(original);
      } catch {
        useAuthStore.getState().clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default request;
