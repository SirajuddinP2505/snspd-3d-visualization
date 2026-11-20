import React from 'react';
import { KNOWLEDGE_TOPICS } from '../data/knowledgeContent';

export default function Knowledge() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <div className="font-mono text-xs font-medium text-cyan-400">
            Scientific Knowledge Base
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            Physics of Superconducting Nanowire Detectors
          </h1>
          <p className="mt-3 text-base text-slate-300">
            Structured definitions, physical equations, and schematic diagrams covering quantum
            superconductivity, nonequilibrium hotspots, and cryogenic signal readout.
          </p>
        </div>

        {/* Scientific Diagrams */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#091022] p-5">
            <img
              src={`${import.meta.env.BASE_URL}images/snspd-cross-section.svg`}
              alt="SNSPD layered cross-section showing substrate, dielectric spacer, gold contacts, nanowire, and hotspot"
              referrerPolicy="no-referrer"
              className="w-full rounded-lg"
            />
            <p className="mt-3 text-sm text-slate-300">
              Figure 1: Cross-sectional device geometry showing the ultrathin nanowire on a dielectric
              optical cavity substrate and localized hotspot formation.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#091022] p-5">
            <img
              src={`${import.meta.env.BASE_URL}images/readout-circuit.svg`}
              alt="Equivalent electrical circuit of an SNSPD with DC bias, kinetic inductance Lk, variable hotspot resistance Rn, and 50 Ohm load"
              referrerPolicy="no-referrer"
              className="w-full rounded-lg"
            />
            <p className="mt-3 text-sm text-slate-300">
              Figure 2: Equivalent electro-thermal circuit illustrating how kinetic inductance Lk and
              the 50 Ω load shape pulse rise and recovery times.
            </p>
          </div>
        </div>

        {/* 12 Core Topics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {KNOWLEDGE_TOPICS.map((topic) => (
            <article
              key={topic.id}
              className="rounded-xl border border-slate-800 bg-[#091022] p-6"
            >
              <h2 className="text-lg font-bold text-slate-50">{topic.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">{topic.summary}</p>
              <div className="equation-box my-3.5">{topic.equation}</div>
              <p className="text-xs leading-relaxed text-slate-400">{topic.explanation}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
