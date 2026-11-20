import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-[#03060e] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="font-semibold text-slate-200">
            SNSPD – Understanding Single Photon Detection
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Interactive 3D Scientific Visualization · Cryogenic Quantum Photonics Education
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
          <Link to="/simulation" className="transition-colors hover:text-cyan-300">
            3D Lab
          </Link>
          <Link to="/working-principle" className="transition-colors hover:text-cyan-300">
            6 Stages
          </Link>
          <Link to="/knowledge" className="transition-colors hover:text-cyan-300">
            Physics Guide
          </Link>
          <Link to="/applications" className="transition-colors hover:text-cyan-300">
            Applications
          </Link>
          <Link to="/about" className="transition-colors hover:text-cyan-300">
            References &amp; About
          </Link>
        </div>
      </div>
    </footer>
  );
}
