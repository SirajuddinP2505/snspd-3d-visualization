import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { WORKING_STAGES } from '../data/stages';
import StageNavigation from '../components/StageNavigation';
import NanowireModel from '../components/NanowireModel';
import { useSnspdSimulation } from '../hooks/useSnspdSimulation';

export default function WorkingPrinciple() {
  const [stageIdx, setStageIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const sim = useSnspdSimulation('NbN');

  const stage = WORKING_STAGES[stageIdx];

  useEffect(() => {
    setPhase(0);
    const start = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      const elapsed = (now - start) / 2800;
      const clamped = Math.min(1, elapsed);
      setPhase(clamped);
      if (clamped < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [stageIdx, replayKey]);

  let photonProgress = 0;
  let hotspotIntensity = 0;
  let currentDiversion = 0;

  if (stage.id === 2) {
    photonProgress = phase;
  } else if (stage.id === 3) {
    photonProgress = 1;
    hotspotIntensity = 0.25 + phase * 0.75;
  } else if (stage.id === 4) {
    hotspotIntensity = 1;
    currentDiversion = 0.35 + phase * 0.65;
  } else if (stage.id === 5) {
    hotspotIntensity = 0.85 - phase * 0.25;
    currentDiversion = 1 - phase * 0.25;
  } else if (stage.id === 6) {
    hotspotIntensity = Math.max(0, 0.6 * (1 - phase));
    currentDiversion = Math.max(0, 0.75 * (1 - phase));
  }

  const cutoffNs =
    stage.id < 5 ? 6 : stage.id === 5 ? 8 + phase * 8 : 16 + phase * 34;
  const stageWave = sim.fullWaveform.filter((pt) => pt.timeNs <= cutoffNs);

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <div className="font-mono text-xs font-medium text-cyan-400">
            Six-Stage Detection Mechanism
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            How an SNSPD Detects a Single Photon
          </h1>
          <p className="mt-2.5 text-sm text-slate-300 sm:text-base">
            Step through each physical stage with synchronized 3D geometry, equations, and readout
            response.
          </p>
        </div>

        <StageNavigation
          stages={WORKING_STAGES}
          currentIndex={stageIdx}
          onSelectStage={setStageIdx}
          onReplay={() => setReplayKey((k) => k + 1)}
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <NanowireModel
            wavelengthNm={1550}
            widthNm={100}
            temperatureK={2.5}
            isSuperconducting={true}
            photonProgress={photonProgress}
            hotspotIntensity={hotspotIntensity}
            currentDiversion={currentDiversion}
          />

          <div className="rounded-xl border border-slate-800 bg-[#091022] p-6">
            <div className="font-mono text-xs font-medium text-cyan-400">
              Stage 0{stage.id} of 06
            </div>
            <h2 className="mt-1.5 text-2xl font-bold text-slate-50">{stage.title}</h2>
            <p className="mt-1 text-sm font-medium text-cyan-300">{stage.subtitle}</p>

            <p className="mt-4 text-sm leading-relaxed text-slate-200">{stage.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{stage.details}</p>

            <div className="equation-box my-4">{stage.equation}</div>

            <div className="mb-5 rounded-lg border border-slate-800 bg-[#060c1a] p-3.5 text-xs leading-relaxed text-slate-300">
              <strong className="text-sky-300">Key Takeaway: </strong>
              {stage.keyPoint}
            </div>

            <div>
              <div className="mb-2 font-mono text-[11px] text-slate-400">
                Synchronized Readout Voltage V(t) [mV]
              </div>
              <div className="h-[160px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={stageWave}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.14)"
                    />
                    <XAxis
                      dataKey="timeNs"
                      type="number"
                      domain={[0, 50]}
                      stroke="#94a3b8"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis domain={[0, 1]} stroke="#fb923c" tick={{ fontSize: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="voltageMv"
                      stroke="#fb923c"
                      fill="rgba(251, 146, 60, 0.22)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
