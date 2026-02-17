import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Copy, Download, Check, X, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalysisResult {
  score: number;
  label: string;
  breakdown: {
    criteria: string;
    score: number;
    issue: string;
  }[];
  problems: string[];
}

interface RewriteResult {
  oldScore: number;
  newScore: number;
  article: string;
  improvements: string[];
  rewritesRemaining: number;
}

export default function AppPage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setToast('🐐 Welcome to Pro! You now have 30 rewrites.');
      setTimeout(() => setToast(''), 5000);
      setSearchParams({});
      refreshProfile();
    }
  }, [searchParams]);

  const getAnalysesRemaining = () => {
    if (!user) {
      return 0;
    }
    if (profile?.plan === 'pro') {
      return 999;
    }
    return Math.max(0, 5 - (profile?.analyses_count || 0));
  };

  const handleAnalyze = async () => {
    if (!article.trim()) {
      setError('Please paste your article first');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const remaining = getAnalysesRemaining();
    if (remaining <= 0 && profile?.plan === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    setError('');
    setAnalyzing(true);
    setAnalysisResult(null);
    setRewriteResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ article }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'auth_required') {
          navigate('/login');
          return;
        }
        if (data.error === 'upgrade_required') {
          setShowUpgradeModal(true);
          return;
        }
        if (data.error === 'rate_limit') {
          setError(data.message);
          return;
        }
        throw new Error(data.message || 'Failed to analyze');
      }

      setAnalysisResult(data);
      refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze article');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    if (profile?.plan !== 'pro') {
      setShowUpgradeModal(true);
      return;
    }

    setError('');
    setRewriting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rewrite`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ article }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'limit_reached') {
          setError(data.message);
          return;
        }
        throw new Error(data.message || 'Failed to rewrite');
      }

      setRewriteResult(data);
      refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to rewrite article');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = () => {
    if (rewriteResult) {
      navigator.clipboard.writeText(rewriteResult.article);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (rewriteResult) {
      const blob = new Blob([rewriteResult.article], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'goatgeo-rewrite.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 40) return 'text-red-500 border-red-500';
    if (score <= 70) return 'text-yellow-500 border-yellow-500';
    return 'text-green-500 border-green-500';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="GoatGeo" className="w-8 h-8" />
            <span className="font-bold text-xl">GoatGeo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link to="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${profile?.plan === 'pro' ? 'bg-green-500 text-black' : 'bg-zinc-700 text-gray-300'}`}>
                    {profile?.plan === 'pro' ? 'Pro 🐐' : 'Free'}
                  </span>
                  <Menu size={16} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-zinc-800">
                      {user.email}
                    </div>
                    {profile?.plan !== 'pro' && (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors text-green-500"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Input Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8">Analyze Your Content</h1>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <textarea
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              placeholder="Paste your article here..."
              className="w-full min-h-[300px] bg-zinc-800 border border-zinc-700 rounded-lg p-4 focus:outline-none focus:border-green-500 transition-colors resize-y"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-400">{article.length} characters</span>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-black font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing... ~5 seconds
                </>
              ) : (
                <>Analyze Now 🐐</>
              )}
            </button>

            <p className="text-center text-sm text-gray-400 mt-3">
              {!user
                ? 'Sign in to start analyzing'
                : profile?.plan === 'pro'
                  ? 'Unlimited analyses'
                  : `${getAnalysesRemaining()} analyses remaining this month`
              }
            </p>
          </div>
        </section>

        {/* Analysis Results */}
        {analysisResult && (
          <section className="mb-12 animate-fade-in">
            {/* Score Card */}
            <div className="text-center mb-8">
              <div className={`inline-block border-4 ${getScoreColor(analysisResult.score)} rounded-2xl p-8`}>
                <div className="text-7xl font-bold">{analysisResult.score}/100</div>
                <div className="text-xl mt-2">{analysisResult.label}</div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left">Criteria</th>
                    <th className="px-6 py-4 text-left">Score</th>
                    <th className="px-6 py-4 text-left">Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.breakdown.map((item, index) => (
                    <tr key={index} className="border-t border-zinc-800">
                      <td className="px-6 py-4">{item.criteria}</td>
                      <td className="px-6 py-4 font-semibold">{item.score}/20</td>
                      <td className="px-6 py-4 text-gray-400">{item.issue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Problems */}
            <div className="bg-zinc-900 border-2 border-red-500 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">🔴 Top 3 Issues</h3>
              <ol className="space-y-2">
                {analysisResult.problems.map((problem, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-bold text-red-500">{index + 1}.</span>
                    <span>{problem}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Rewrite CTA */}
            <div className="bg-zinc-900 border-2 border-green-500 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Want the AI-optimized version?</h3>
              <p className="text-gray-400 mb-6">Get this article rewritten for AI visibility</p>
              <button
                onClick={handleRewrite}
                disabled={rewriting}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {rewriting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Rewriting... ~10 seconds
                  </>
                ) : (
                  <>Rewrite for AI ✨</>
                )}
              </button>
              {profile?.plan !== 'pro' && (
                <p className="text-sm text-gray-400 mt-3">Pro feature - $29/month</p>
              )}
              {profile?.plan === 'pro' && (
                <p className="text-sm text-gray-400 mt-3">
                  Rewrites: {profile.rewrites_count}/30 remaining
                </p>
              )}
            </div>
          </section>
        )}

        {/* Rewrite Results */}
        {rewriteResult && (
          <section className="animate-fade-in">
            {/* Score Comparison */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-4">
                <span className="text-4xl font-bold text-red-500">{rewriteResult.oldScore}/100</span>
                <span className="text-2xl">→</span>
                <span className="text-4xl font-bold text-green-500">{rewriteResult.newScore}/100</span>
                <Check className="text-green-500" size={32} />
              </div>
            </div>

            {/* Rewritten Article */}
            <div className="bg-zinc-900 border-l-4 border-green-500 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Rewritten Article</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download size={18} />
                    Download .md
                  </button>
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{rewriteResult.article}</pre>
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">✅ What we improved</h3>
              <ul className="space-y-2">
                {rewriteResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="text-green-500 flex-shrink-0" size={20} />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">��</span>
              <h2 className="text-3xl font-bold mb-2">Unlock AI Rewrites</h2>
              <p className="text-gray-400">
                {!user
                  ? 'Create a free account to continue analyzing'
                  : 'Upgrade to Pro to get your articles rewritten for AI visibility'}
              </p>
            </div>

            {!user ? (
              <div className="space-y-4">
                <Link
                  to="/signup"
                  className="block w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg text-center transition-colors"
                >
                  Create Free Account
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-gray-400 hover:text-white text-sm"
                >
                  Maybe later
                </button>
              </div>
            ) : (
              <>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500 flex-shrink-0" size={20} />
                    <span>Unlimited analyses</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500 flex-shrink-0" size={20} />
                    <span>30 rewrites/month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="text-green-500 flex-shrink-0" size={20} />
                    <span>AI-optimized articles</span>
                  </li>
                </ul>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-500">$29/month</div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const response = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`,
                          },
                        }
                      );
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      }
                    } catch (err) {
                      console.error('Failed to create checkout session:', err);
                    }
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors"
                >
                  Upgrade Now
                </button>

                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-gray-400 hover:text-white mt-4 text-sm"
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
