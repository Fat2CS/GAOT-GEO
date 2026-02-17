import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Animated orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Page non trouvée
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
          >
            <Home size={20} />
            Retour à l'accueil
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-3 rounded-lg transition-all hover:scale-105"
          >
            <ArrowLeft size={20} />
            Page précédente
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-zinc-800">
          <p className="text-gray-500 mb-4">Liens utiles :</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/app"
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              Application
            </Link>
            <Link
              to="/login"
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/signup"
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              Inscription
            </Link>
            <Link
              to="/contact"
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
