import axios from "axios";

export const apiClient = axios.create({
  withCredentials: true,
});

let getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";
let onTokenRefresh = (accessToken) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", accessToken);
  }
};
let onAuthFailure = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};
let refreshPromise = null;

export const configureApiClientAuth = ({
  getToken,
  handleTokenRefresh,
  handleAuthFailure,
} = {}) => {
  if (getToken) {
    getAccessToken = getToken;
  }

  if (handleTokenRefresh) {
    onTokenRefresh = handleTokenRefresh;
  }

  if (handleAuthFailure) {
    onAuthFailure = handleAuthFailure;
  }
};

const requestNewAccessToken = async () => {
  const response = await axios.post(
    "/api/v1/users/refresh-token",
    {},
    {
      withCredentials: true,
    },
  );

  const accessToken = response.data?.data?.accessToken;

  if (!accessToken) {
    throw new Error("Refresh response did not include an access token");
  }

  onTokenRefresh(accessToken);
  return accessToken;
};

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes("/refresh-token");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || requestNewAccessToken();
      const accessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      onAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export default apiClient;
