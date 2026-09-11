import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    generateKundliApi,
    getAllKundlisApi,
    getKundliApi,
    deleteKundliApi,
    getAIReadingApi,
} from "../services/kundli.api";

const initialState = {
    kundlis: [],
    selected: null,
    reading: null,
    loading: false,
    readingLoading: false,
    error: null,
};

export const generateKundli = createAsyncThunk(
    "kundli/generate",
    async (data, { rejectWithValue }) => {
        try {
            const res = await generateKundliApi(data);
            return res.data.kundli;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to generate kundli");
        }
    }
);

export const fetchAllKundlis = createAsyncThunk(
    "kundli/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getAllKundlisApi();
            return res.data.kundlis;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch kundlis");
        }
    }
);

export const fetchKundli = createAsyncThunk(
    "kundli/fetchOne",
    async (id, { rejectWithValue }) => {
        try {
            const res = await getKundliApi(id);
            return res.data.kundli;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch kundli");
        }
    }
);

export const deleteKundli = createAsyncThunk(
    "kundli/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteKundliApi(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete");
        }
    }
);

export const fetchAIReading = createAsyncThunk(
    "kundli/aiReading",
    async ({ id, lang }, { rejectWithValue }) => {
        try {
            const res = await getAIReadingApi(id, lang);
            return res.data.reading;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to generate reading");
        }
    }
);

const kundliSlice = createSlice({
    name: "kundli",
    initialState,
    reducers: {
        clearSelected: (state) => { state.selected = null; state.reading = null; },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateKundli.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(generateKundli.fulfilled, (state, action) => {
                state.loading = false;
                state.selected = action.payload;
                state.kundlis.unshift(action.payload);
            })
            .addCase(generateKundli.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(fetchAllKundlis.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAllKundlis.fulfilled, (state, action) => { state.loading = false; state.kundlis = action.payload; })
            .addCase(fetchAllKundlis.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(fetchKundli.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchKundli.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload; })
            .addCase(fetchKundli.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        builder
            .addCase(deleteKundli.fulfilled, (state, action) => {
                state.kundlis = state.kundlis.filter((k) => k._id !== action.payload);
                if (state.selected?._id === action.payload) { state.selected = null; state.reading = null; }
            })
            .addCase(deleteKundli.rejected, (state, action) => { state.error = action.payload; });

        builder
            .addCase(fetchAIReading.pending, (state) => { state.readingLoading = true; state.error = null; })
            .addCase(fetchAIReading.fulfilled, (state, action) => {
                state.readingLoading = false;
                state.reading = action.payload;
                if (state.selected) state.selected.aiReading = action.payload;
            })
            .addCase(fetchAIReading.rejected, (state, action) => { state.readingLoading = false; state.error = action.payload; });
    },
});

export const { clearSelected, clearError } = kundliSlice.actions;

export const selectKundlis = (state) => state.kundli.kundlis;
export const selectSelected = (state) => state.kundli.selected;
export const selectReading = (state) => state.kundli.reading;
export const selectKundliLoading = (state) => state.kundli.loading;
export const selectReadingLoading = (state) => state.kundli.readingLoading;
export const selectKundliError = (state) => state.kundli.error;

export default kundliSlice.reducer;