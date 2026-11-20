import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import SnspdSceneCanvas from '../three/SnspdSceneCanvas';

export default function Hero() {
  const [heroTime, setHeroTime] = useState(0);

  // Gentle repeating photon-to-hotspot cycle in hero 3D scene
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;

    const id = window.setInterval(() => {
      setHeroTime((prev) => (prev + 0.035) % 1);
    }, 60);
    return () => window.clearInterval(id);
  }, []);

  const photonProgress = heroTime < 0.35 ? heroTime / 0.35 : 1;
  const hotspotIntensity =
    heroTime >= 0.35 ? Math.max(0, 1 - (heroTime - 0.35) / 0.55) : 0;

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b border-slate-800/80 bg-[#040814]">
      {/* Live 3D SNSPD Background */}
      <div className="absolute inset-0 z-0 opacity-90">
        <SnspdSceneCanvas
          viewMode="hero"
          photonProgress={photonProgress}
          hotspotIntensity={hotspotIntensity}
          currentDiversion={hotspotIntensity * 0.7}
          showLabels={false}
          interactive={false}
        />
      </div>

      {/* Measured contrast scrim for 4.5:1 text legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(4, 8, 20, 0.94) 0%, rgba(4, 8, 20, 0.78) 48%, rgba(4, 8, 20, 0.32) 100%)',
        }}
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-xs font-medium tracking-wider text-cyan-400">
            Cryogenic Quantum Photonic Instrumentation
          </div>

          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-[3.4rem]">
            SNSPD – Understanding Single Photon Detection
          </h1>

          <p className="mt-4 text-lg font-medium text-cyan-300 sm:text-xl">
            An Interactive 3D Exploration of Superconducting Nanowire Technology
          </p>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Explore how an ultrathin superconducting nanowire cooled below its critical
            temperature converts the arrival of a single photon into a measurable electrical
            voltage pulse through nonequilibrium hotspot formation and current redistribution.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/simulation"
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              Explore 3D Simulation
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/working-principle"
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-[#0a1224]/90 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-500/60 hover:bg-slate-800"
            >
              <PlayCircle size={17} />
              How It Works
            </Link>
          </div>

          {/* 3-Column Quantitative Specification Strip */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-[#080f20]/90 px-4 py-3">
              <div className="font-mono text-lg font-bold tabular-nums text-cyan-300">
                0.8 – 4.0 K
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                Cryogenic Operating Regime
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#080f20]/90 px-4 py-3">
              <div className="font-mono text-lg font-bold tabular-nums text-cyan-300">
                4 – 10 nm
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                Typical Film Thickness
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#080f20]/90 px-4 py-3">
              <div className="font-mono text-lg font-bold tabular-nums text-cyan-300">
                E = hc / λ
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                Single-Photon Trigger
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
