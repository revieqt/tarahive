import GradientBlobs from "@/components/GradientBlobs";
import TextField from "@/components/TextField";
import PasswordField from "@/components/PasswordField";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerificationCode, resetPassword } from "@/services/authService";
import { MdArrowBack } from "react-icons/md";

const RESEND_COOLDOWN = 180; // 3 minutes

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");

  // Cooldown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (cooldown > 0) return;

    try {
      setSending(true);
      const { code } = await sendEmailVerificationCode(email);
      setSentCode(code);
      setEmailSent(true);
      setCooldown(RESEND_COOLDOWN);
      setSuccessMsg(`Verification code sent to ${email}`);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to send verification code.");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = () => {
    setErrorMsg("");
    if (!verificationCode) {
      setErrorMsg("Please enter the verification code.");
      return;
    }
    if (verificationCode === sentCode) {
      setCodeVerified(true);
      setSuccessMsg("Code verified! Now set your new password.");
    } else {
      setErrorMsg("Invalid verification code.");
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSending(true);
      await resetPassword(email, newPassword);
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to reset password.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !sending) {
      if (!emailSent) {
        handleSendCode();
      } else if (!codeVerified) {
        verifyCode();
      } else {
        handleResetPassword();
      }
    }
  };

  const getButtonConfig = () => {
    if (!emailSent) {
      return {
        title: sending
          ? "Sending..."
          : cooldown > 0
          ? `Resend Code (${cooldown}s)`
          : "Send Code",
        onClick: handleSendCode,
        disabled: sending || cooldown > 0 || !email,
      };
    }

    if (!codeVerified) {
      return {
        title: "Verify Code",
        onClick: verifyCode,
        disabled: !verificationCode,
      };
    }

    return {
      title: sending ? "Resetting..." : "Reset Password",
      onClick: handleResetPassword,
      disabled: sending || !newPassword || !confirmPassword,
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div
      style={{ backgroundColor }}
      className="relative min-h-screen flex items-center justify-center px-4"
    >
      <GradientBlobs />

      {/* Back Button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 z-10 p-2 rounded-lg transition-opacity hover:opacity-70"
        style={{ color: textColor }}
        aria-label="Go back"
      >
        <MdArrowBack size={24} />
      </button>

      {/* Forgot Password Form Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 style={{ color: textColor }} className="text-3xl font-bold mb-2 font-poppins">
            Forgot Password
          </h1>
          <p style={{ color: textColor }} className="opacity-70 text-sm font-poppins">
            {!emailSent
              ? "Enter your email to reset your password"
              : !codeVerified
              ? "Enter the verification code sent to your email"
              : "Set your new password"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Step 1: Email Input */}
          {!emailSent && (
            <div>
              <label
                htmlFor="email"
                style={{ color: textColor }}
                className="block text-sm font-medium mb-2 font-poppins"
              >
                Email Address
              </label>
              <TextField
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                type="email"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* Step 2: Code Verification */}
          {emailSent && !codeVerified && (
            <div>
              <label
                htmlFor="code"
                style={{ color: textColor }}
                className="block text-sm font-medium mb-2 font-poppins"
              >
                Verification Code
              </label>
              <p style={{ color: textColor }} className="text-xs opacity-60 mb-2 font-poppins">
                Code sent to: <strong>{email}</strong>
              </p>
              <TextField
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                type="text"
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* Step 3: Password Reset */}
          {codeVerified && (
            <>
              <div>
                <label
                  htmlFor="newPassword"
                  style={{ color: textColor }}
                  className="block text-sm font-medium mb-2 font-poppins"
                >
                  New Password
                </label>
                <PasswordField
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  style={{ color: textColor }}
                  className="block text-sm font-medium mb-2 font-poppins"
                >
                  Confirm Password
                </label>
                <PasswordField
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3">
              <p style={{ color: "#ef4444" }} className="text-sm font-poppins">
                {errorMsg}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p style={{ color: "#22c55e" }} className="text-sm font-poppins">
                {successMsg}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={buttonConfig.onClick}
            disabled={buttonConfig.disabled}
            style={{
              backgroundColor: secondaryColor,
              opacity: buttonConfig.disabled ? 0.6 : 1,
            }}
            className="w-full text-white font-semibold py-3 rounded-[15px] transition-opacity duration-200 hover:opacity-90 mt-6 font-poppins"
          >
            {buttonConfig.title}
          </button>

          {/* Back to Login Link */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/login")}
              style={{ color: secondaryColor }}
              className="text-sm font-medium hover:opacity-80 transition-opacity font-poppins"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
