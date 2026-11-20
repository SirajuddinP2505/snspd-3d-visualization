import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { APPLICATIONS } from '../data/applicationsData';

export default function Applications() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <div className="font-mono text-xs font-medium text-cyan-400">
            Frontiers of Single-Photon Science
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            Applications of SNSPD Technology
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Because SNSPDs combine high detection efficiency, low dark count rates, and picosecond
            timing resolution from visible to infrared wavelengths, they enable experiments that were
            previously photon-starved.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {APPLICATIONS.map((app) => (
            <article
              key={app.id}
              className="rounded-xl border border-slate-800 bg-[#091022] p-6"
            >
              <div className="font-mono text-xs text-cyan-400">{app.category}</div>
              <h2 className="mt-1.5 text-xl font-bold text-slate-50">{app.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                {app.description}
              </p>
              <div className="mt-4 rounded-lg border border-slate-800 bg-[#060c1a] p-3.5 text-xs leading-relaxed text-sky-200">
                <strong>SNSPD Advantage: </strong>
                {app.benefit}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            Test Wavelengths &amp; Bias in the 3D Lab
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
