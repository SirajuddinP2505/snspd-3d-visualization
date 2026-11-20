import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, Flame, Radio, Snowflake, Waves, ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import { APPLICATIONS } from '../data/applicationsData';

const FEATURES = [
  {
    icon: Snowflake,
    title: 'Cryogenic Superconductivity',
    text: 'Cooled below Tc so Cooper pairs sustain lossless DC bias current with virtually zero dark counts.',
  },
  {
    icon: Waves,
    title: 'Broadband Infrared Sensitivity',
    text: 'Ultrathin nanoscale strips respond to visible, telecom (1550 nm), and mid-infrared single photons.',
  },
  {
    icon: Flame,
    title: 'Picosecond Hotspot Physics',
    text: 'Single-photon absorption breaks Cooper pairs, forming a localized nonequilibrium resistive barrier.',
  },
  {
    icon: Activity,
    title: 'Low Timing Jitter',
    text: 'Fast current redistribution yields sharp pulse rising edges suitable for precision time-tagging.',
  },
  {
    icon: Cpu,
    title: 'Interactive 3D & Oscilloscope',
    text: 'Inspect macroscopic cryostat integration, microscopic current crowding, and live readout pulses.',
  },
  {
    icon: Radio,
    title: 'Free-Running Operation',
    text: 'Recovers passively via kinetic inductance Lk/RL without requiring external active gating circuits.',
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <div className="font-mono text-xs font-medium text-cyan-400">
              Core Scientific Pillars
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              Why Superconducting Nanowires Excel at Single-Photon Counting
            </h2>
            <p className="mt-3 text-base text-slate-300">
              Unlike semiconductor avalanche photodiodes, SNSPDs rely on a superconducting phase
              transition triggered by individual photon quanta.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-xl border border-slate-800 bg-[#091022] p-6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{feat.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <div className="font-mono text-xs font-medium text-cyan-400">
              Real-World Impact
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              Scientific &amp; Quantum Applications
            </h2>
            <p className="mt-3 text-base text-slate-300">
              From intercontinental quantum networks to deep-space laser links, SNSPDs sit at the
              heart of modern photon-starved experiments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {APPLICATIONS.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-slate-800 bg-[#091022] p-6"
              >
                <div className="font-mono text-xs text-cyan-400">{app.category}</div>
                <h3 className="mt-2 text-lg font-bold text-slate-100">{app.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {app.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-500/50 hover:bg-slate-800"
            >
              Explore All 7 Application Domains
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
