import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess('Check your email for a password reset link!');
        setResetMode(false);
      } else {
        await signIn(email.trim(), password);
        navigate('/app');
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email or password incorrect. Try "Forgot password?" if you need to reset it.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo_goat_geo_ss_ar_(3).png" alt="GoatGeo" className="w-12 h-12" />
          <span className="text-2xl font-bold">GoatGeo</span>
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            {resetMode ? 'Reset Password' : 'Welcome back 🐐'}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {resetMode ? 'Enter your email to receive a reset link' : 'Sign in to your account'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            {!resetMode && (
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (resetMode ? 'Sending...' : 'Signing in...') : (resetMode ? 'Send Reset Link' : 'Sign In')}
            </button>

            <button
              type="button"
              onClick={() => {
                setResetMode(!resetMode);
                setError('');
                setSuccess('');
              }}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              {resetMode ? 'Back to Sign In' : 'Forgot password?'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-500 hover:text-green-400 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
