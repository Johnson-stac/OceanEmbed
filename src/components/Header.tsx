import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, BarChart3, LineChart, Network, Menu, ChevronRight, CalendarRange } from 'lucide-react';

export type TabType = 'Prediction' | 'Visualization' | 'Correlation' | 'TemporalExplorer';

interface HeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'Prediction', onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'Prediction', label: 'Dashboard & Control', icon: <BarChart3 className="w-4 h-4" />, desc: 'Main prediction interface' },
    { id: 'TemporalExplorer', label: 'Spatiotemporal Explorer', icon: <CalendarRange className="w-4 h-4" />, desc: 'Date span averages & condition matcher' },
    { id: 'Visualization', label: '3D Profiler', icon: <LineChart className="w-4 h-4" />, desc: 'Layer-by-layer 3D grid' },
    { id: 'Correlation', label: 'Analytics', icon: <Network className="w-4 h-4" />, desc: 'Data correlation plots' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shrink-0">
      <div className="max-w-full mx-auto px-6 lg:px-8 xl:px-12 h-[88px] flex items-center justify-between">
        
        {/* Left: Logo & Branding */}
        <div className="flex items-center space-x-5">
          {/* Dropdown Menu - only on Prediction Page */}
          {location.pathname === '/' && (
            <div className="relative z-[9999]" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700 focus:outline-none"
                title="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>

            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden py-2">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Navigation Menu
                </div>
                {tabs.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange?.(tab.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left flex items-center justify-between px-4 py-3 transition-colors ${
                        isActive ? 'bg-slate-700/50 border-l-2 border-cyan-400' : 'hover:bg-slate-700/30 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {tab.icon}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {tab.label}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {tab.desc}
                          </div>
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-cyan-500 opacity-50" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          )}

          <div className="text-cyan-400 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <Waves className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight leading-none text-white">OceanEmbed</h1>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Demo
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-[0.15em] font-semibold">Subsurface Intelligence</p>
          </div>
        </div>
        
        {/* Center: Main Navigation */}
        <div className="flex-1 hidden lg:flex justify-center items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/fisheries" 
            className={`text-sm font-semibold transition-colors ${location.pathname === '/fisheries' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            Fisheries
          </Link>
        </div>

        {/* Right: Event Info */}
        <div className="hidden md:flex flex-col items-end text-right w-[320px]">
          <div className="text-sm font-bold text-cyan-400 tracking-wider">SIH 2026</div>
          <div className="text-[11px] text-slate-400 font-medium tracking-widest mt-1 uppercase">Problem Statement 026066</div>
        </div>
      </div>
    </header>
  );
};
