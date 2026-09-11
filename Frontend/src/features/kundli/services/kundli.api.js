import axios from "axios";

const api = axios.create({
    baseURL: "/api/kundli",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
                localStorage.setItem("accessToken", data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export const generateKundliApi = (data) => api.post("/generate", data);
export const getAllKundlisApi = () => api.get("/");
export const getKundliApi = (id) => api.get(`/${id}`);
export const deleteKundliApi = (id) => api.delete(`/${id}`);
export const getAIReadingApi = (id, lang = "en") => api.post(`/${id}/reading?lang=${lang}`);