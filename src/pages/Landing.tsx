import { Link } from 'react-router-dom';
import { ArrowRight, Zap, FileCheck, Sparkles, Twitter } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Animated orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 flex items-center justify-center gap-3 animate-fade-in">
            <img src="/logo.png" alt="GoatGeo" className="w-16 h-16" />
            <h1 className="text-5xl font-bold">GoatGeo</h1>
          </div>

          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent animate-fade-in-up">
            Get Your Content Cited by AI
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Google is losing. ChatGPT, Perplexity & Gemini are the new search.
          </p>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 animate-fade-in-up animation-delay-300">
            Is your content visible?
          </p>

          <div className="animate-fade-in-up animation-delay-400">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50"
            >
              Analyze Your Content Free
              <ArrowRight size={20} />
            </Link>
            <p className="text-sm text-gray-500 mt-4">3 free analyses. No credit card.</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-gray-600 rounded-full" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            SEO is dying
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-green-500/50 transition-all hover:-translate-y-1">
              <div className="text-6xl font-bold text-green-500 mb-4">30%</div>
              <p className="text-xl text-gray-300">of searches now go to AI</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-green-500/50 transition-all hover:-translate-y-1">
              <div className="text-6xl font-bold text-red-500 mb-4">0%</div>
              <p className="text-xl text-gray-300">of your SEO content is AI-optimized</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-green-500/50 transition-all hover:-translate-y-1">
              <div className="text-6xl font-bold text-yellow-500 mb-4">👻</div>
              <p className="text-xl text-gray-300">Your competitors are invisible too (for now)</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How it Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileCheck size={40} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold mb-2 text-green-500">1. Paste your article</div>
              <p className="text-gray-400">Drop in your content and let us analyze it</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap size={40} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold mb-2 text-green-500">2. Get your GEO Score</div>
              <p className="text-gray-400">See exactly how AI-friendly your content is</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={40} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold mb-2 text-green-500">3. Get AI-optimized version</div>
              <p className="text-gray-400">Receive a rewritten article that ranks on AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Pricing
          </h2>

          <div className="max-w-md mx-auto bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-green-500 p-8 rounded-3xl hover:scale-105 transition-transform">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold mb-2">Pro</h3>
              <div className="text-5xl font-bold text-green-500 mb-2">$29</div>
              <p className="text-gray-400">per month</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-sm">✓</span>
                </div>
                <span>Unlimited analyses</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-sm">✓</span>
                </div>
                <span>30 rewrites/month</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-sm">✓</span>
                </div>
                <span>GEO Score + breakdown</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-sm">✓</span>
                </div>
                <span>AI-ready articles</span>
              </li>
            </ul>

            <Link
              to="/app"
              className="block w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-4 rounded-lg text-center transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="GoatGeo" className="w-8 h-8" />
            <span className="font-bold">GoatGeo</span>
          </div>

          <nav className="flex gap-8">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link to="/app" className="text-gray-400 hover:text-white transition-colors">App</Link>
            <Link to="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-6">
            <a
              href="https://x.com/GoatGeoOfficiel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-500 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
            <p className="text-gray-400">Built by GoatGeo Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
