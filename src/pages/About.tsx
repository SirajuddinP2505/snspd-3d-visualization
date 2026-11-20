import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SCIENTIFIC_REFERENCES } from '../data/references';

export default function About() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <div className="font-mono text-xs font-medium text-cyan-400">
            About This Platform
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            Educational Mission, Architecture &amp; References
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Built to make cryogenic superconducting single-photon physics intuitive for university
            students, physics/engineering researchers, and science exhibition audiences.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#091022] p-6">
            <h2 className="text-xl font-bold text-slate-50">
              Project Overview &amp; Objectives
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              This platform bridges microscopic quantum concepts—Cooper pairs, quasiparticle
              excitations, and current crowding—with macroscopic electrical measurement signals
              observed on a laboratory oscilloscope.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>
                Distinguish superconducting hotspot detection from semiconductor photodiodes.
              </li>
              <li>
                Visualize the six temporal stages from photon arrival to kinetic-inductance recovery.
              </li>
              <li>
                Provide transparent phenomenological parameter exploration in real-time 3D.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#091022] p-6">
            <h2 className="text-xl font-bold text-slate-50">
              Technologies &amp; Modeling Approach
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Constructed with a modular client-side scientific architecture:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-400">
              <li>React 19, TypeScript, Vite, and Tailwind CSS v4</li>
              <li>
                Three.js WebGL PBR rendering with procedural geometries, instanced Cooper-pair
                carriers, and raycast component inspection
              </li>
              <li>Recharts real-time oscilloscope and current-diversion trace</li>
              <li>Lucide React technical iconography</li>
            </ul>
          </div>
        </div>

        <div className="mb-5">
          <div className="font-mono text-xs font-medium text-cyan-400">
            Peer-Reviewed Literature
          </div>
          <h2 className="mt-1.5 text-2xl font-bold text-slate-50">Scientific References</h2>
        </div>

        <div className="grid gap-4">
          {SCIENTIFIC_REFERENCES.map((ref) => (
            <div
              key={ref.doi}
              className="rounded-xl border border-slate-800 bg-[#091022] p-5"
            >
              <div className="font-semibold text-slate-100">
                {ref.title} ({ref.year})
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {ref.authors}. <em className="text-slate-300">{ref.journal}</em>, {ref.volume}.
              </div>
              <a
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-cyan-400 hover:text-cyan-300"
              >
                DOI: {ref.doi}
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
