import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSessionApi, getSessionsApi, getSessionApi, deleteSessionApi } from "../services/chatApi";

const initialState = {
    sessions: [],
    activeSession: null, // { _id, title, messages: [] }
    streamingText: "",   // current AI response being streamed
    isStreaming: false,
    loading: false,
    error: null,
};

export const createSession = createAsyncThunk(
    "chat/createSession",
    async (_, { rejectWithValue }) => {
        try {
            const res = await createSessionApi();
            return res.data.session;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to create session");
        }
    }
);

export const fetchSessions = createAsyncThunk(
    "chat/fetchSessions",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getSessionsApi();
            return res.data.sessions;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch sessions");
        }
    }
);

export const fetchSession = createAsyncThunk(
    "chat/fetchSession",
    async (id, { rejectWithValue }) => {
        try {
            const res = await getSessionApi(id);
            return res.data.session;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch session");
        }
    }
);

export const deleteSession = createAsyncThunk(
    "chat/deleteSession",
    async (id, { rejectWithValue }) => {
        try {
            await deleteSessionApi(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete session");
        }
    }
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        // Called when user sends a message — optimistically add to UI
        addUserMessage: (state, action) => {
            if (state.activeSession) {
                state.activeSession.messages.push({
                    role: "user",
                    content: action.payload,
                });
            }
        },

        // Called as stream chunks arrive
        appendStreamChunk: (state, action) => {
            state.streamingText += action.payload;
            state.isStreaming = true;
        },

        // Called when stream is done — commit streamed text as assistant message
        commitStreamedMessage: (state) => {
            if (state.activeSession && state.streamingText) {
                state.activeSession.messages.push({
                    role: "assistant",
                    content: state.streamingText,
                });
            }
            state.streamingText = "";
            state.isStreaming = false;
        },

        setStreaming: (state, action) => { state.isStreaming = action.payload; },
        clearStreamingText: (state) => { state.streamingText = ""; },
        clearError: (state) => { state.error = null; },
        clearActiveSession: (state) => { state.activeSession = null; },
    },
    extraReducers: (builder) => {

        builder
            .addCase(createSession.fulfilled, (state, action) => {
                state.sessions.unshift(action.payload);
                state.activeSession = { ...action.payload, messages: [] };
            })
            .addCase(createSession.rejected, (state, action) => {
                state.error = action.payload;
            });

        builder
            .addCase(fetchSessions.pending, (state) => { state.loading = true; })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(fetchSession.pending, (state) => { state.loading = true; })
            .addCase(fetchSession.fulfilled, (state, action) => {
                state.loading = false;
                state.activeSession = action.payload;
            })
            .addCase(fetchSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(deleteSession.fulfilled, (state, action) => {
                state.sessions = state.sessions.filter((s) => s._id !== action.payload);
                if (state.activeSession?._id === action.payload) {
                    state.activeSession = null;
                }
            })
            .addCase(deleteSession.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    addUserMessage, appendStreamChunk, commitStreamedMessage,
    setStreaming, clearStreamingText, clearError, clearActiveSession,
} = chatSlice.actions;

export const selectSessions = (state) => state.chat.sessions;
export const selectActiveSession = (state) => state.chat.activeSession;
export const selectStreamingText = (state) => state.chat.streamingText;
export const selectIsStreaming = (state) => state.chat.isStreaming;
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatError = (state) => state.chat.error;

export default chatSlice.reducer;