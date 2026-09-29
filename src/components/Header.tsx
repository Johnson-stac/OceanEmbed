import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Waves,
  ChevronDown,
  Check,
  Shield,
  Compass,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth, type UserRole } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { user, role, setRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation
  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/3d', label: '3D Ocean' },
    { to: '/fisheries', label: 'Fisheries' },
    { to: '/routes', label: 'Marine Routes' },
    ...(role === 'researcher' ? [{ to: '/analytics', label: 'Analytics' }] : []),
  ];

  return (
    <header className="bg-[#0B3A82] dark:bg-[#06152d] text-white border-b-2 border-[#082C64] dark:border-[#0e2752] shrink-0 sticky top-0 z-[1000] select-none h-20 font-sans shadow-md transition-colors">

      <div className="max-w-7xl xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left: Prominent Branding */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-3.5 group">
            <div className="p-2 bg-white text-[#0B3A82] shadow-sm">
              <Waves className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-xl sm:text-2xl tracking-tight leading-none">
                OceanEmbed
              </span>
              <span className="text-[11px] text-blue-200 font-semibold tracking-widest uppercase mt-0.5">
                Subsurface Ocean Intelligence
              </span>
            </div>
          </NavLink>

          {/* Navigation Links - Clear Breathing Room, Inter font, Strong Active State */}
          <nav className="hidden md:flex items-center space-x-1.5 ml-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors border-b-4 ${
                    isActive
                      ? 'bg-[#082C64] text-white border-white font-bold'
                      : 'text-blue-100 hover:text-white hover:bg-[#0D469B] border-transparent'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right: Theme Toggle & Role Switcher */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          {/* Light / Dark Mode Toggle per Requirement #2 */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#082C64] hover:bg-[#051C40] dark:bg-[#0a1e3f] dark:hover:bg-[#0e2752] text-xs font-bold text-white border border-blue-400/40 dark:border-blue-400/20 transition-all cursor-pointer shadow-sm rounded-none"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
                <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-200 animate-in duration-200" />
                <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Dark</span>
              </>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-[#082C64] hover:bg-[#051C40] dark:bg-[#0a1e3f] dark:hover:bg-[#0e2752] text-xs font-bold text-white border border-blue-400/40 dark:border-blue-400/20 transition-colors cursor-pointer"
              title="Click to toggle Explorer / Researcher mode"
            >
              <span className="w-2.5 h-2.5 rounded-none bg-blue-300 ring-2 ring-white/30" />
              <span className="tracking-wide uppercase">
                {role === 'researcher' ? 'Researcher Mode' : 'Explorer Mode'}
              </span>
              <span className="text-blue-300 font-mono hidden sm:inline">●</span>
              <ChevronDown className="w-4 h-4 text-blue-200" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 shadow-xl py-1 z-[1100] text-xs text-slate-900 dark:text-slate-100 rounded-none animate-in fade-in duration-100">
                <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F0F5FC] dark:bg-[#0b162c]">
                  <div className="font-bold text-[#0B3A82] dark:text-blue-400 text-sm">{user?.name ?? 'Dr. Alok Sharma'}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{user?.affiliation ?? 'Oceanographic Workspace'}</div>
                </div>

                <div className="p-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Switch Workspace Role
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('explorer')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      role === 'explorer' ? 'bg-[#E1EDFB] dark:bg-blue-950/60 text-[#0B3A82] dark:text-blue-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-[#0B3A82] dark:text-blue-400" />
                      <span>Explorer</span>
                    </div>
                    {role === 'explorer' && <Check className="w-4 h-4 text-[#0B3A82] dark:text-blue-400" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('researcher')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      role === 'researcher' ? 'bg-[#E1EDFB] dark:bg-blue-950/60 text-[#0B3A82] dark:text-blue-300 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-[#0B3A82] dark:text-blue-400" />
                      <span>Researcher (Full Suite)</span>
                    </div>
                    {role === 'researcher' && <Check className="w-4 h-4 text-[#0B3A82] dark:text-blue-400" />}
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#0B3A82] dark:text-blue-400 hover:bg-[#F0F5FC] dark:hover:bg-slate-800 text-left font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Return to Role Selection</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-[#082C64] dark:border-[#0e2752] bg-[#082C64] dark:bg-[#06152d] px-2 py-1.5 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`text-xs font-semibold px-2.5 py-1 whitespace-nowrap ${
                isActive ? 'text-white border-b-2 border-white font-bold' : 'text-blue-200 hover:text-white'
              }`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </header>
  );
};
