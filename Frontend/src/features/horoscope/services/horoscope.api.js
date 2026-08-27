import axios from "axios";

const api = axios.create({
    baseURL: "/api/horoscope",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getHoroscopeBySignApi = (sign, period = "daily", lang) =>
    api.get(`/${sign}/${period}`, {
        params: lang ? { lang } : undefined,
    });

export const getTodayHoroscopeApi = (sign, lang) =>
    api.get(`/today/${sign}`, {
        params: lang ? { lang } : undefined,
    });

export const getAllHoroscopesApi = (period = "daily", lang) =>
    api.get("/all", {
        params: {
            period,
            ...(lang ? { lang } : {}),
        },
    });

export const getHoroscopeStreamUrl = (sign, period = "daily", lang) => {
    const query = lang ? `?lang=${encodeURIComponent(lang)}` : "";
    return `/api/horoscope/${sign}/${period}/stream${query}`;
};

export const streamHoroscopeApi = async (
    sign,
    period = "daily",
    lang,
    { onChunk, onComplete, onError, signal } = {}
) => {
    try {
        const token = localStorage.getItem("accessToken");
        const url = getHoroscopeStreamUrl(sign, period, lang);

        const response = await fetch(url, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulated = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            if (onChunk) onChunk(chunk, accumulated);
        }

        if (onComplete) onComplete(accumulated);
        return accumulated;
    } catch (err) {
        if (onError) onError(err);
        throw err;
    }
};