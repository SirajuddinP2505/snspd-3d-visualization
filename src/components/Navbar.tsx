import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/simulation', label: '3D Laboratory' },
  { to: '/working-principle', label: '6-Stage Principle' },
  { to: '/knowledge', label: 'Science Guide' },
  { to: '/applications', label: 'Applications' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-[#050914]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="font-display whitespace-nowrap shrink-0 text-lg font-bold tracking-tight text-slate-50"
        >
          SNSPD Lab
        </Link>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          className="hidden lg:flex items-center gap-6"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 text-sm font-medium transition-colors border-b-2 py-1 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-300 hover:border-slate-600 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/simulation"
            className="hidden sm:inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Launch Simulator
          </Link>

          <button
            type="button"
            className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {open && (
        <nav
          className="border-t border-slate-800 bg-[#050914] px-4 py-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/simulation"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Launch Simulator
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
