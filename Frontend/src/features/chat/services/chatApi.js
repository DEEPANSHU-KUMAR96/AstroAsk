import axios from "axios";

const api = axios.create({
    baseURL: "/api/chat",
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

export const createSessionApi = () => api.post("/");
export const getSessionsApi = () => api.get("/");
export const getSessionApi = (id) => api.get(`/${id}`);
export const deleteSessionApi = (id) => api.delete(`/${id}`);

// Direct upload to /api/upload/chat-image
export const uploadChatImageApi = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("accessToken");
    return axios.post("/api/upload/chat-image", formData, {
        withCredentials: true,
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "multipart/form-data",
        },
    });
};

// Helper to get auth headers with automatic refresh on 401
const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");
    let res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.status === 401) {
        try {
            const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
            if (data?.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                token = data.accessToken;
                res = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            throw new Error("Session expired. Please log in again.");
        }
    }
    return res;
};

// SSE streaming — returns EventSource-like stream via fetch
// Supports optional imageFile attachment sent as multipart/form-data directly to /api/chat/:id/message
export const sendMessageStream = async (sessionId, message, onChunk, onDone, onError, lang = "en", imageFile = null) => {
    const isHindi = lang === "hi";
    const langName = isHindi ? "Hindi" : "English";
    const langInstruction = isHindi
        ? "CRITICAL INSTRUCTION: You must respond strictly in Hindi language (हिंदी में जवाब दें)."
        : "CRITICAL INSTRUCTION: You must respond strictly in English language. Do not use Hindi or Devanagari script.";

    const cleanText = (message || "").trim();
    const messageWithInstruction = cleanText
        ? `[Language Instruction: Respond ONLY in ${langName}]\n\n${cleanText}`
        : (imageFile ? `[Language Instruction: Respond ONLY in ${langName}]\nPlease analyze this astrology image / chart in ${langName}.` : "");

    try {
        let fetchOptions;

        if (imageFile) {
            const formData = new FormData();
            formData.append("message", messageWithInstruction);
            formData.append("lang", lang);
            formData.append("image", imageFile);

            fetchOptions = {
                method: "POST",
                headers: {
                    "X-Language": lang,
                    "X-Language-Name": langName,
                },
                body: formData,
            };
        } else {
            fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Language": lang,
                    "X-Language-Name": langName,
                },
                body: JSON.stringify({
                    message: messageWithInstruction,
                    originalMessage: cleanText,
                    lang,
                    language: langName,
                    preferredLanguage: langName,
                    responseLanguage: lang,
                    languageInstruction: langInstruction,
                }),
            };
        }

        const response = await fetchWithAuth(`/api/chat/${sessionId}/message?lang=${lang}`, fetchOptions);

        if (!response.ok) {
            let errMsg = "Request failed";
            try {
                const err = await response.json();
                errMsg = err.message || errMsg;
            } catch {
                errMsg = `HTTP error ${response.status}`;
            }
            onError(errMsg);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const rawLine of lines) {
                const line = rawLine.trim();
                if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === "chunk" && data.text) onChunk(data.text);
                        if (data.type === "done") onDone(data.sessionId, data.title);
                        if (data.type === "error") onError(data.message);
                    } catch {
                        // incomplete chunk
                    }
                }
            }
        }

        if (buffer.trim().startsWith("data: ")) {
            try {
                const data = JSON.parse(buffer.trim().slice(6));
                if (data.type === "chunk" && data.text) onChunk(data.text);
                if (data.type === "done") onDone(data.sessionId, data.title);
                if (data.type === "error") onError(data.message);
            } catch {
                // ignore
            }
        }
    } catch (err) {
        onError(err.message || "Network error occurred");
    }
};