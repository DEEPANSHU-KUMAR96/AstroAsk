// OpenCage Geocoding — place name → { lat, lng, timezone }
import {config} from '../config/config.js';

const BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

export const geocodePlace = async (place) => {
    const apiKey = config.OPENCAGE_API_KEY;
    const query = typeof place === "string" ? place.trim() : "";

    if (!apiKey) {
        throw new Error("Geocoding is not configured: OPENCAGE_API_KEY is missing");
    }

    if (!query) {
        throw new Error("Birth place is required");
    }

    const params = new URLSearchParams({
        q: query,
        key: apiKey,
        limit: 1,
        no_annotations: 0,
        language: "en",
    });

    let res;
    let data;
    try {
        res = await fetch(`${BASE_URL}?${params}`);
        data = await res.json();
    } catch {
        throw new Error("Geocoding service is unavailable");
    }

    if (!res.ok || data.status?.code !== 200) {
        throw new Error(`Geocoding failed: ${data.status?.message || "Unknown error"}`);
    }

    if (!data.results?.length) {
        throw new Error(`Place not found: "${place}"`);
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry;
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
        throw new Error(`Invalid coordinates returned for: "${query}"`);
    }
    const timezone = result.annotations?.timezone?.name || "UTC";

    return {
        lat: Number(lat),
        lng: Number(lng),
        timezone,
        formatted: result.formatted,
    };
};