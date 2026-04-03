import GradientBlobs from "@/components/GradientBlobs";
import PasswordField from "@/components/PasswordField";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "@/services/authService";
import { useSession } from "@/context/SessionContext";
import { MdArrowBack } from "react-icons/md";

export default function ChangePasswordScreen() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");

  const handleUpdatePassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!session?.user?.id || !session.accessToken) {
      setErrorMsg("You need to be logged in to change your password");
      return;
    }

    if (!oldPassword) {
      setErrorMsg("Please enter your old password.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await updatePassword({
        userId: session.user.id,
        oldPassword,
        newPassword,
        confirmPassword,
        accessToken: session.accessToken,
      });
      setSuccessMsg("Password updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleUpdatePassword();
    }
  };

  return (
    <div
      style={{ backgroundColor }}
      className="relative min-h-screen flex items-center justify-center px-4"
    >
      <GradientBlobs />

      {/* Back Button */}
      <button
        onClick={() => navigate("/profile")}
        className="absolute top-4 left-4 z-10 p-2 rounded-lg transition-opacity hover:opacity-70"
        style={{ color: textColor }}
        aria-label="Go back"
      >
        <MdArrowBack size={24} />
      </button>

      {/* Change Password Form Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 style={{ color: textColor }} className="text-3xl font-bold mb-2 font-poppins">
            Change Password
          </h1>
          <p style={{ color: textColor }} className="opacity-70 text-sm font-poppins">
            Enter a minimum of 6 characters
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Old Password */}
          <div>
            <label
              htmlFor="oldPassword"
              style={{ color: textColor }}
              className="block text-sm font-medium mb-2 font-poppins"
            >
              Old Password
            </label>
            <PasswordField
              placeholder="Enter your old password"
              value={oldPassword}
              onChangeText={setOldPassword}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* New Password */}
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

          {/* Confirm Password */}
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
            onClick={handleUpdatePassword}
            disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
            style={{
              backgroundColor: secondaryColor,
              opacity: isLoading || !oldPassword || !newPassword || !confirmPassword ? 0.6 : 1,
            }}
            className="w-full text-white font-semibold py-3 rounded-[15px] transition-opacity duration-200 hover:opacity-90 mt-6 font-poppins"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>

          {/* Back to Profile Link */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/profile")}
              style={{ color: secondaryColor }}
              className="text-sm font-medium hover:opacity-80 transition-opacity font-poppins"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
