import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    registerApi,
    verifyEmailApi,
    resendOtpApi,
    loginApi,
    logoutApi,
    getMeApi,
    updateProfileApi,
    changePasswordApi,
    forgotPasswordApi,
    resetPasswordApi,
} from "../services/auth.api";

// ─── Initial State ────────────────────────────────────────────────
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    // separate loading states for specific actions
    otpLoading: false,
    profileLoading: false,

    // for multi-step flows (register → verify, forgot → reset)
    pendingEmail: null,
    needsVerification: false,
};

// ─── Thunks ───────────────────────────────────────────────────────

export const register = createAsyncThunk(
    "auth/register",
    async (data, { rejectWithValue }) => {
        try {
            const res = await registerApi(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Registration failed");
        }
    }
);

export const verifyEmail = createAsyncThunk(
    "auth/verifyEmail",
    async (data, { rejectWithValue }) => {
        try {
            const res = await verifyEmailApi(data);
            localStorage.setItem("accessToken", res.data.accessToken);
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Verification failed");
        }
    }
);

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async (data, { rejectWithValue }) => {
        try {
            const res = await resendOtpApi(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to resend OTP");
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (data, { rejectWithValue }) => {
        try {
            const res = await loginApi(data);

            // Backend returns 403 with needsVerification flag
            if (res.data.needsVerification) {
                return rejectWithValue({ needsVerification: true, message: res.data.message });
            }

            localStorage.setItem("accessToken", res.data.accessToken);
            return res.data.user;
        } catch (err) {
            const data = err.response?.data;
            if (data?.needsVerification) {
                return rejectWithValue({ needsVerification: true, message: data.message });
            }
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await logoutApi();
            localStorage.removeItem("accessToken");
        } catch (err) {
            // Clear locally even if API fails
            localStorage.removeItem("accessToken");
            return rejectWithValue(err.response?.data?.message || "Logout failed");
        }
    }
);

export const getMe = createAsyncThunk(
    "auth/getMe",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMeApi();
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
        }
    }
);

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (data, { rejectWithValue }) => {
        try {
            const res = await updateProfileApi(data);
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Update failed");
        }
    }
);

export const changePassword = createAsyncThunk(
    "auth/changePassword",
    async (data, { rejectWithValue }) => {
        try {
            const res = await changePasswordApi(data);
            localStorage.removeItem("accessToken"); // force re-login
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Password change failed");
        }
    }
);

export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async (data, { rejectWithValue }) => {
        try {
            const res = await forgotPasswordApi(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Request failed");
        }
    }
);

export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async (data, { rejectWithValue }) => {
        try {
            const res = await resetPasswordApi(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Reset failed");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        setPendingEmail: (state, action) => { state.pendingEmail = action.payload; },
        clearPendingEmail: (state) => { state.pendingEmail = null; },
    },
    extraReducers: (builder) => {

        // ── Register ──────────────────────────────────────────────────
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingEmail = action.meta.arg.email; // save for verify step
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Verify Email ──────────────────────────────────────────────
        builder
            .addCase(verifyEmail.pending, (state) => {
                state.otpLoading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.otpLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.pendingEmail = null;
                state.needsVerification = false;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.otpLoading = false;
                state.error = action.payload;
            });

        // ── Resend OTP ────────────────────────────────────────────────
        builder
            .addCase(resendOtp.pending, (state) => {
                state.otpLoading = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.otpLoading = false;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.otpLoading = false;
                state.error = action.payload;
            });

        // ── Login ─────────────────────────────────────────────────────
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.needsVerification = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                if (action.payload?.needsVerification) {
                    state.needsVerification = true;
                    state.pendingEmail = action.meta.arg.email;
                    state.error = action.payload.message;
                } else {
                    state.error = action.payload;
                }
            });

        // ── Logout ────────────────────────────────────────────────────
        builder
            .addCase(logout.fulfilled, () => initialState) // reset everything
            .addCase(logout.rejected, () => initialState); // clear locally anyway

        // ── Get Me ────────────────────────────────────────────────────
        builder
            .addCase(getMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            });

        // ── Update Profile ────────────────────────────────────────────
        builder
            .addCase(updateProfile.pending, (state) => {
                state.profileLoading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.user = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.error = action.payload;
            });

        // ── Change Password ───────────────────────────────────────────
        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, () => initialState) // force re-login
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Forgot Password ───────────────────────────────────────────
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingEmail = action.meta.arg.email;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Reset Password ────────────────────────────────────────────
        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.pendingEmail = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setPendingEmail, clearPendingEmail } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectOtpLoading = (state) => state.auth.otpLoading;
export const selectProfileLoading = (state) => state.auth.profileLoading;
export const selectPendingEmail = (state) => state.auth.pendingEmail;
export const selectNeedsVerification = (state) => state.auth.needsVerification;

export default authSlice.reducer;