import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  clearError,
  setPendingEmail,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectOtpLoading,
  selectProfileLoading,
  selectPendingEmail,
  selectNeedsVerification,
} from "../state/auth.slice";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const otpLoading = useSelector(selectOtpLoading);
  const profileLoading = useSelector(selectProfileLoading);
  const pendingEmail = useSelector(selectPendingEmail);
  const needsVerification = useSelector(selectNeedsVerification);

  const handleRegister = async (data) => {
    const res = await dispatch(register(data));
    if (register.fulfilled.match(res)) {
      toast.success("OTP sent to your email! Please verify.");
      dispatch(setPendingEmail(data.email));
      navigate("/verify-email");
    } else {
      toast.error(res.payload || "Registration failed");
    }
  };

  const handleVerifyEmail = async (data) => {
    const res = await dispatch(verifyEmail({ email: pendingEmail, otp: data.otp }));
    if (verifyEmail.fulfilled.match(res)) {
      toast.success("Email verified! Let's set up your profile.");
      navigate("/birth-details");
    } else {
      toast.error(res.payload || "Invalid OTP");
    }
  };

  const handleResendOtp = async () => {
    const res = await dispatch(resendOtp({ email: pendingEmail }));
    if (resendOtp.fulfilled.match(res)) {
      toast.success("New OTP sent");
    } else {
      toast.error(res.payload || "Failed to resend OTP");
    }
  };

  const handleLogin = async (data) => {
    const res = await dispatch(login(data));
    if (login.fulfilled.match(res)) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      if (needsVerification) {
        toast.error("Please verify your email first");
        navigate("/verify-email");
      } else {
        toast.error(res.payload || "Login failed");
      }
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  const handleUpdateProfile = async (data) => {
    const res = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(res)) {
      toast.success("Profile updated");
    } else {
      toast.error(res.payload || "Update failed");
    }
  };

  const handleChangePassword = async (data) => {
    const res = await dispatch(changePassword(data));
    if (changePassword.fulfilled.match(res)) {
      toast.success("Password changed. Please log in again.");
      navigate("/login");
    } else {
      toast.error(res.payload || "Password change failed");
    }
  };

  const handleForgotPassword = async (data) => {
    const res = await dispatch(forgotPassword(data));
    if (forgotPassword.fulfilled.match(res)) {
      toast.success("OTP sent if email exists");
      dispatch(setPendingEmail(data.email));
      navigate("/reset-password");
    } else {
      toast.error(res.payload || "Request failed");
    }
  };

  const handleResetPassword = async (data) => {
    const res = await dispatch(resetPassword({ email: pendingEmail, ...data }));
    if (resetPassword.fulfilled.match(res)) {
      toast.success("Password reset. Please log in.");
      navigate("/login");
    } else {
      toast.error(res.payload || "Reset failed");
    }
  };

  const fetchMe = () => dispatch(getMe());

  const clear = () => dispatch(clearError());

  return {
    // state
    user,
    isAuthenticated,
    loading,
    error,
    otpLoading,
    profileLoading,
    pendingEmail,
    needsVerification,

    // actions
    handleRegister,
    handleVerifyEmail,
    handleResendOtp,
    handleLogin,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
    handleForgotPassword,
    handleResetPassword,
    fetchMe,
    clearError: clear,
  };
};

export default useAuth;