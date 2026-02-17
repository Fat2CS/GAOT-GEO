import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      alert("Password updated successfully!");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <img
            src="/logo_goat_geo_ss_ar_(3).png"
            alt="GoatGeo"
            className="w-12 h-12"
          />
          <span className="text-2xl font-bold">GoatGeo</span>
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Reset Your Password
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Enter your new password
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
