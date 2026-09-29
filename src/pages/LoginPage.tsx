import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { Waves, Compass, Microscope, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    loginAs(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between font-sans select-none">
      {/* Top Simple Header */}
      <header className="w-full bg-[#0a3663] text-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-white text-[#0a3663] rounded-none">
              <Waves className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight">OceanEmbed</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-cyan-200 ml-1.5 sm:ml-2">
                Subsurface Intelligence
              </span>
            </div>
          </div>
          <span className="text-[11px] sm:text-xs font-mono font-medium text-cyan-100 bg-[#07284b] px-2 sm:px-2.5 py-0.5 sm:py-1 border border-cyan-800">
            SIH 2026
          </span>
        </div>
      </header>

      {/* Main Role Selection Content */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center items-center">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-sans">
            Welcome to OceanEmbed
          </h1>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold text-ocean-700 mb-2 sm:mb-3">
            Satellite Embedding-Based Deep Learning Framework
          </p>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Reconstruction of Subsurface Ocean Temperature from Surface Satellite Observations across the North Indian Ocean Basin.
          </p>
        </div>

        {/* Two Clean Sharp Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl">
          {/* EXPLORER */}
          <div className="border border-slate-300 bg-white p-5 sm:p-6 flex flex-col justify-between hover:border-ocean-600 transition-colors shadow-none">
            <div>
              <div className="p-2.5 bg-slate-100 text-ocean-700 inline-block mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-2">
                EXPLORER
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Explore ocean conditions, interactive maps, 3D layer visualization, fisheries suitability, and marine route analysis.
              </p>
            </div>
            <button
              onClick={() => handleSelectRole('explorer')}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-ocean-700 font-bold text-xs uppercase tracking-wider border border-ocean-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RESEARCHER */}
          <div className="border border-ocean-600 bg-white p-6 flex flex-col justify-between shadow-none relative">
            <div className="absolute top-0 right-0 bg-ocean-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              Scientific Tools
            </div>
            <div>
              <div className="p-2.5 bg-ocean-50 text-ocean-700 inline-block mb-4">
                <Microscope className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-2">
                RESEARCHER
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Access detailed prediction values, simulated GLORYS reference benchmarks, model validation metrics (MAE/RMSE), depth-wise error, and observation reports.
              </p>
            </div>
            <button
              onClick={() => handleSelectRole('researcher')}
              className="w-full py-2.5 px-4 bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs uppercase tracking-wider border border-ocean-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-ocean-600" />
          <span>Role-based UI access · You can switch roles at any time from the navigation bar</span>
        </div>
      </main>

      {/* Clean Scientific Footer */}
      <footer className="w-full border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-slate-50">
        OceanEmbed Physical Oceanography Intelligence Platform · North Indian Ocean (5°N–30°N, 60°E–100°E)
      </footer>
    </div>
  );
};
