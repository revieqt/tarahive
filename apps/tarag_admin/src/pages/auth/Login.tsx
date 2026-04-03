import GradientBlobs from "@/components/GradientBlobs";
import TextField from "@/components/TextField";
import PasswordField from "@/components/PasswordField";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/authService";
import { useSession } from "@/context/SessionContext";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { updateSession } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const secondaryColor = useThemeColor({}, "secondary");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(identifier, password);

      // Check if user type is 'traveler'
      if (response.user.type === "traveler") {
        setError("Access denied. Traveler accounts cannot access the admin panel.");
        setLoading(false);
        return;
      }

      // Save user data and tokens to SessionContext
      await updateSession({
        user: {
          id: response.user._id,
          fname: response.user.fname,
          lname: response.user.lname,
          username: response.user.username,
          email: response.user.email,
          bdate: new Date(response.user.bdate),
          gender: response.user.gender,
          contactNumber: response.user.contactNumber,
          profileImage: response.user.profileImages?.[0] || "",
          status: response.user.status,
          type: response.user.type,
          createdOn: new Date(response.user.createdOn),
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      // Navigate to dashboard
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !loading) {
      const form = (e.target as HTMLInputElement).closest("form");
      if (form) {
        const event = new Event("submit", { bubbles: true, cancelable: true }) as any;
        form.dispatchEvent(event);
      }
    }
  };

  return (
    <div
      style={{ backgroundColor }}
      className="relative min-h-screen flex items-center justify-center px-4"
    >
      <GradientBlobs />

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 style={{ color: textColor }} className="text-3xl font-bold mb-2">
            Welcome Back
          </h1>
          <p style={{ color: textColor }} className="opacity-70 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Username Field */}
          <div>
            <label
              htmlFor="identifier"
              style={{ color: textColor }}
              className="block text-sm font-medium mb-2"
            >
              Email or Username
            </label>
            <TextField
              placeholder="Enter your email or username"
              value={identifier}
              onChangeText={setIdentifier}
              type="text"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              style={{ color: textColor }}
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <PasswordField
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3">
              <p style={{ color: "#ef4444" }} className="text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="/forgot-password"
              style={{ color: secondaryColor }}
              className="text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !identifier || !password}
            style={{
              backgroundColor: secondaryColor,
              opacity: loading || !identifier || !password ? 0.6 : 1,
            }}
            className="w-full text-white font-semibold py-3 rounded-[15px] transition-opacity duration-200 hover:opacity-90"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
