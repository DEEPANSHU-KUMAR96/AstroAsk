import axios from "axios";

const api = axios.create({
    baseURL: "/api/tarot",
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
                if (data?.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                    original.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(original);
                }
            } catch {
                localStorage.removeItem("accessToken");
            }
        }
        return Promise.reject(error);
    }
);

export const getSpreadsApi = () => api.get("/spreads");

export const drawCardsApi = (spread, question, lang = "en") =>
    api.get("/draw", { params: { spread, question, lang } });

// Helper to get authenticated fetch response with automatic token refresh on 401
const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");

    // First attempt
    let res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    // If 401, attempt silent token refresh
    if (res.status === 401) {
        try {
            const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
            if (data?.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                token = data.accessToken;
                res = await fetch(url, {
                    ...options,
                    credentials: "include",
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch {
            localStorage.removeItem("accessToken");
        }
    }

    return res;
};

export const drawCardsStream = async (
    spread,
    question,
    lang = "en",
    onCards,
    onChunk,
    onDone,
    onError
) => {
    try {
        const params = new URLSearchParams({
            spread,
            lang,
            ...(question?.trim() && { question: question.trim() }),
        });

        const response = await fetchWithAuth(`/api/tarot/draw/stream?${params}`);

        if (!response.ok) {
            let errMsg = "Unable to draw cards at this moment.";
            try {
                const errData = await response.json();
                errMsg = errData.message || errMsg;
            } catch {
                if (response.status === 401) {
                    errMsg = "Please sign in to draw tarot cards.";
                } else if (response.status === 429) {
                    errMsg = "Too many readings requested. Please wait a minute.";
                } else {
                    errMsg = `Server error (${response.status}). Please try again.`;
                }
            }
            onError?.(errMsg);
            return;
        }

        if (!response.body) {
            onError?.("Streaming response not supported by browser.");
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
                if (!line.startsWith("data: ")) continue;

                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === "cards") onCards?.(data.cards, data.spread);
                    if (data.type === "chunk" && data.text) onChunk?.(data.text);
                    if (data.type === "done") onDone?.();
                    if (data.type === "error") onError?.(data.message || "An error occurred during reading.");
                } catch {
                    // Ignore partial JSON parsing errors
                }
            }
        }

        // Process leftover buffer if any
        if (buffer.trim().startsWith("data: ")) {
            try {
                const data = JSON.parse(buffer.trim().slice(6));
                if (data.type === "cards") onCards?.(data.cards, data.spread);
                if (data.type === "chunk" && data.text) onChunk?.(data.text);
                if (data.type === "done") onDone?.();
                if (data.type === "error") onError?.(data.message);
            } catch {
                // Ignore
            }
        }
    } catch (err) {
        onError?.(err?.message || "Network error occurred while drawing cards.");
    }
};