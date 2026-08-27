import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getHoroscopeBySignApi,
    getTodayHoroscopeApi,
    getAllHoroscopesApi,
} from "../services/horoscope.api";

const initialState = {
    horoscope: null,
    allHoroscopes: [],
    todayHoroscope: null,
    selectedSign: "aries",
    selectedPeriod: "daily",
    selectedLang: "en",
    streamingContent: "",
    isStreaming: false,
    loading: false,
    allLoading: false,
    todayLoading: false,
    error: null,
};

export const fetchHoroscope = createAsyncThunk(
    "horoscope/fetchHoroscope",
    async ({ sign, period = "daily", lang }, { rejectWithValue }) => {
        try {
            const res = await getHoroscopeBySignApi(sign, period, lang);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch horoscope"
            );
        }
    }
);

export const fetchTodayHoroscope = createAsyncThunk(
    "horoscope/fetchTodayHoroscope",
    async ({ sign, lang }, { rejectWithValue }) => {
        try {
            const res = await getTodayHoroscopeApi(sign, lang);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch today's horoscope"
            );
        }
    }
);

export const fetchAllHoroscopes = createAsyncThunk(
    "horoscope/fetchAllHoroscopes",
    async ({ period = "daily", lang } = {}, { rejectWithValue }) => {
        try {
            const res = await getAllHoroscopesApi(period, lang);
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch all horoscopes"
            );
        }
    }
);

const horoscopeSlice = createSlice({
    name: "horoscope",
    initialState,
    reducers: {
        setSelectedSign: (state, action) => {
            state.selectedSign = action.payload;
        },
        setSelectedPeriod: (state, action) => {
            state.selectedPeriod = action.payload;
        },
        setSelectedLang: (state, action) => {
            state.selectedLang = action.payload;
        },
        setStreamingContent: (state, action) => {
            state.streamingContent = action.payload;
        },
        appendStreamingChunk: (state, action) => {
            state.streamingContent += action.payload;
        },
        setIsStreaming: (state, action) => {
            state.isStreaming = action.payload;
        },
        clearHoroscopeError: (state) => {
            state.error = null;
        },
        resetStreaming: (state) => {
            state.streamingContent = "";
            state.isStreaming = false;
        },
        resetHoroscopeState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHoroscope.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHoroscope.fulfilled, (state, action) => {
                state.loading = false;
                state.horoscope = action.payload;
            })
            .addCase(fetchHoroscope.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchTodayHoroscope.pending, (state) => {
                state.todayLoading = true;
                state.error = null;
            })
            .addCase(fetchTodayHoroscope.fulfilled, (state, action) => {
                state.todayLoading = false;
                state.todayHoroscope = action.payload;
            })
            .addCase(fetchTodayHoroscope.rejected, (state, action) => {
                state.todayLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllHoroscopes.pending, (state) => {
                state.allLoading = true;
                state.error = null;
            })
            .addCase(fetchAllHoroscopes.fulfilled, (state, action) => {
                state.allLoading = false;
                state.allHoroscopes = action.payload;
            })
            .addCase(fetchAllHoroscopes.rejected, (state, action) => {
                state.allLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setSelectedSign,
    setSelectedPeriod,
    setSelectedLang,
    setStreamingContent,
    appendStreamingChunk,
    setIsStreaming,
    clearHoroscopeError,
    resetStreaming,
    resetHoroscopeState,
} = horoscopeSlice.actions;

export const selectHoroscope = (state) => state.horoscope.horoscope;
export const selectAllHoroscopes = (state) => state.horoscope.allHoroscopes;
export const selectTodayHoroscope = (state) => state.horoscope.todayHoroscope;
export const selectSelectedSign = (state) => state.horoscope.selectedSign;
export const selectSelectedPeriod = (state) => state.horoscope.selectedPeriod;
export const selectSelectedLang = (state) => state.horoscope.selectedLang;
export const selectStreamingContent = (state) => state.horoscope.streamingContent;
export const selectIsStreaming = (state) => state.horoscope.isStreaming;
export const selectHoroscopeLoading = (state) => state.horoscope.loading;
export const selectTodayLoading = (state) => state.horoscope.todayLoading;
export const selectAllLoading = (state) => state.horoscope.allLoading;
export const selectHoroscopeError = (state) => state.horoscope.error;

export default horoscopeSlice.reducer;
