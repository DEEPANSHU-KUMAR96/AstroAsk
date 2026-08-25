import axios from "axios";

// ─── Instance ────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api/auth",
  withCredentials: true, // sends refreshToken cookie automatically
});

// ─── Request interceptor ─────────────────────────────────────────
// Attach accessToken from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────
// If 401 → try to refresh token → retry original request
// If refresh fails → clear storage → redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest); // retry original request with new token
      } catch {
        // Refresh also failed — force logout
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error); // let Redux thunk handle the error
  }
);

// ─── Auth API calls ───────────────────────────────────────────────
// No try/catch here — errors bubble up to Redux thunk's rejectWithValue

// POST /api/auth/register
// body: { name, email, password }
export const registerApi = (data) => api.post("/register", data);

// POST /api/auth/verify-email
// body: { email, otp }
export const verifyEmailApi = (data) => api.post("/verify-email", data);

// POST /api/auth/resend-otp
// body: { email }
export const resendOtpApi = (data) => api.post("/resend-otp", data);

// POST /api/auth/login
// body: { email, password }
export const loginApi = (data) => api.post("/login", data);

// POST /api/auth/logout  — protected
export const logoutApi = () => api.post("/logout");

// GET /api/auth/me  — protected
export const getMeApi = () => api.get("/me");

// PUT /api/auth/update-profile  — protected
// body: { name, birthDate, birthTime, birthPlace, language }
export const updateProfileApi = (data) => api.put("/update-profile", data);

// PUT /api/auth/change-password  — protected
// body: { currentPassword, newPassword }
export const changePasswordApi = (data) => api.put("/change-password", data);

// POST /api/auth/forgot-password
// body: { email }
export const forgotPasswordApi = (data) => api.post("/forgot-password", data);

// POST /api/auth/reset-password
// body: { email, otp, newPassword }
export const resetPasswordApi = (data) => api.post("/reset-password", data);

// POST /api/auth/refresh  — uses httpOnly cookie automatically
export const refreshTokenApi = () =>
  axios.post("/api/auth/refresh", {}, { withCredentials: true });