import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Brain, Eye, EyeOff, CheckCircle } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    experience: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/v1/users/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        targetRole: formData.role,
        experienceLevel: formData.experience,
      });

      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    {
      text: "At least 8 characters",
      met: formData.password.length >= 8,
    },
    {
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(formData.password),
    },
    {
      text: "Contains lowercase letter",
      met: /[a-z]/.test(formData.password),
    },
    {
      text: "Contains number",
      met: /\d/.test(formData.password),
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>

            <h1 className="text-3xl font-bold">AI Interview</h1>
          </div>

          <p className="text-slate-400">
            Create your account to start practicing
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">Create Account</h2>

            <p className="text-slate-400">Start your AI interview journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Role + Experience */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Target Role
                </label>

                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Role</option>

                  <option value="frontend">Frontend Developer</option>

                  <option value="backend">Backend Developer</option>

                  <option value="fullstack">Full Stack Developer</option>

                  <option value="data-science">Data Scientist</option>
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Experience
                </label>

                <select
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Level</option>

                  <option value="beginner">Beginner</option>

                  <option value="intermediate">Intermediate</option>

                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 pr-12 text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <p className="mb-3 text-sm font-medium text-slate-300">
                  Password Requirements
                </p>

                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle
                        className={`h-4 w-4 ${
                          req.met ? "text-green-500" : "text-slate-600"
                        }`}
                      />

                      <span
                        className={
                          req.met ? "text-green-400" : "text-slate-400"
                        }
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                required
                className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isLoading || formData.password !== formData.confirmPassword
              }
              className="h-12 w-full rounded-2xl bg-blue-600 font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-slate-700" />

            <span className="px-4 text-sm text-slate-400">OR</span>

            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* Google Button */}
          <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 py-3 font-medium transition hover:bg-slate-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.207 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.732 0-14.41 4.388-17.694 10.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.185 0-9.625-3.317-11.283-7.946l-6.522 5.025C9.438 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Login */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
