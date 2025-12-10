import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onNavigate: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#dc143c]/95 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-4 md:py-6 gap-6">
          <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => onNavigate(AppMode.GENERATE)}>
             <div className="w-14 h-14 bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 rounded-xl flex items-center justify-center text-white font-serif font-black text-2xl shadow-lg group-hover:scale-105 transition-transform border-2 border-white/20 transform rotate-3 group-hover:rotate-0 duration-300">
               AI
             </div>
             <div className="flex flex-col items-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black tracking-widest uppercase leading-none text-center drop-shadow-lg">
                   <span className="text-white drop-shadow-md">Digital </span>
                   <span className="text-brand-gold drop-shadow-md">Beauty </span>
                   <span className="text-green-300 drop-shadow-md">AI Studio</span>
                </h1>
                <p className="text-sm md:text-base text-center text-white/90 font-sans tracking-widest mt-2 font-semibold italic">
                   Where Beauty Meets Digital Intelligence
                </p>
             </div>
          </div>

          <nav className="flex space-x-1 bg-[#dc143c] p-1.5 rounded-full border-2 border-white/20 shadow-xl overflow-x-auto max-w-full">
            <button
              onClick={() => onNavigate(AppMode.GENERATE)}
              className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 uppercase ${
                currentMode === AppMode.GENERATE 
                  ? 'bg-white text-[#dc143c] shadow-md transform scale-105' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => onNavigate(AppMode.ANIMATE)}
              className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 uppercase ${
                currentMode === AppMode.ANIMATE
                  ? 'bg-white text-[#dc143c] shadow-md transform scale-105' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Animate (Veo)
            </button>
            <button
              onClick={() => onNavigate(AppMode.GALLERY)}
              className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 uppercase ${
                currentMode === AppMode.GALLERY
                  ? 'bg-white text-[#dc143c] shadow-md transform scale-105' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Gallery
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};