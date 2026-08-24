import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const WaveMark = ({ tone = "brand" }: { tone?: "brand" | "white" }) => (
  <div className="flex items-end gap-[3px] h-5">
    <span className={`w-[3px] h-2 rounded-full ${tone === "white" ? "bg-white/70" : "bg-primary"}`}></span>
    <span className={`w-[3px] h-5 rounded-full ${tone === "white" ? "bg-white" : "bg-primary"}`}></span>
    <span className={`w-[3px] h-3 rounded-full ${tone === "white" ? "bg-white/80" : "bg-accent"}`}></span>
    <span className={`w-[3px] h-4 rounded-full ${tone === "white" ? "bg-white/90" : "bg-primary"}`}></span>
  </div>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      {/* Brand panel — hidden on small screens */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 relative bg-gradient-to-br from-primary to-primary-dark p-10 lg:p-14 flex-col justify-between overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10"></div>
        <div className="absolute -left-10 bottom-10 w-40 h-40 rounded-full bg-accent/20"></div>

        <div className="relative flex items-center gap-2.5">
          <WaveMark tone="white" />
          <span className="font-display font-bold text-lg tracking-tight text-white">
            FluentFeed
          </span>
        </div>

        <div className="relative">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white leading-[1.15] mb-4">
            Find your voice
            <br />
            in English.
          </h2>
          <p className="text-white/75 text-base max-w-sm">
            Speak on a topic, get instant feedback on grammar and vocabulary,
            and track your progress over time.
          </p>
        </div>

        <p className="relative text-white/50 text-xs">
          © {new Date().getFullYear()} FluentFeed
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-md">
          {/* Mobile-only brand mark */}
          <div className="flex md:hidden items-center gap-2.5 mb-8 justify-center">
            <WaveMark />
            <span className="font-display font-bold text-lg tracking-tight text-ink">
              FluentFeed
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-[0_1px_2px_rgba(16,10,60,0.04),0_20px_40px_-24px_rgba(16,10,60,0.18)] p-6 sm:p-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1">
              Welcome back
            </h1>
            <p className="text-ink-soft text-sm sm:text-base mb-6">
              Log in to continue practicing
            </p>

            {error && (
              <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-black/10 rounded-xl text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-4 focus:ring-primary-soft focus:border-primary transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-4 pr-11 py-2.5 border border-black/10 rounded-xl text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-4 focus:ring-primary-soft focus:border-primary transition"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-soft hover:text-primary transition"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition disabled:opacity-50 shadow-[0_10px_24px_-10px_rgba(91,79,233,0.55)]"
              >
                {isSubmitting ? "Logging in…" : "Log In"}
              </button>
            </form>

            <p className="text-center text-sm text-ink-soft mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;