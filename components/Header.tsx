
import React from 'react';

const FilmReelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6.41L1.41 4 0 5.41 2.59 8H4v12H2.59l-1.18 2.59L2.82 24l2.59-2.59V20h12v1.41l2.59 2.59L24 22.59l-1.41-2.59V20H20V4h1.41l1.18-2.59L21.18 0l-2.59 2.59V4H6V2.59L3.41 0 2 1.41l2 2V4H4v2.41zM6 6h12v12H6V6zm2 2v2h8V8H8zm0 4v2h8v-2H8zm0 4v2h8v-2H8z" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl mx-auto text-center mb-6">
      <div className="flex items-center justify-center gap-3">
        <FilmReelIcon className="w-10 h-10 text-indigo-400" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          GeoVid AI Studio
        </h1>
      </div>
      <p className="mt-2 text-lg text-gray-400">
        Create cinematic videos with Veo and explore places with Maps grounding.
      </p>
    </header>
  );
};

export default Header;
