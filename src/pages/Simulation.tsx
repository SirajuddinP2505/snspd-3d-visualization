import React from 'react';
import NanowireModel from '../components/NanowireModel';
import SimulationControls from '../components/SimulationControls';
import Oscilloscope from '../components/Oscilloscope';
import PhotonAnimation from '../components/PhotonAnimation';
import HotspotAnimation from '../components/HotspotAnimation';
import { useSnspdSimulation } from '../hooks/useSnspdSimulation';

export default function Simulation() {
  const sim = useSnspdSimulation('NbN');

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 max-w-3xl">
          <div className="font-mono text-xs font-medium text-cyan-400">
            Interactive 3D Laboratory
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            SNSPD 3D Detector &amp; Signal Analyzer
          </h1>
          <p className="mt-2.5 text-sm text-slate-300 sm:text-base">
            Rotate, zoom, and inspect the 3D superconducting detector, adjust physical parameters,
            and trigger a single-photon detection event synchronized with the live oscilloscope.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-5">
            <NanowireModel
              wavelengthNm={sim.wavelengthNm}
              widthNm={sim.widthNm}
              temperatureK={sim.temperatureK}
              isSuperconducting={sim.metrics.isSuperconducting}
              photonProgress={sim.photonProgress}
              hotspotIntensity={sim.hotspotIntensity}
              currentDiversion={sim.currentDiversion}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PhotonAnimation
                wavelengthNm={sim.wavelengthNm}
                photonProgress={sim.photonProgress}
              />
              <HotspotAnimation
                hotspotIntensity={sim.hotspotIntensity}
                canDetect={sim.metrics.canDetect}
              />
            </div>

            <Oscilloscope
              visibleWaveform={sim.visibleWaveform}
              windowNs={sim.windowNs}
              setWindowNs={sim.setWindowNs}
              isRunning={sim.isRunning}
              timeScale={sim.timeScale}
              setTimeScale={sim.setTimeScale}
              onStart={sim.startSimulation}
              onStop={sim.stopSimulation}
              onReset={sim.resetGraph}
              onReplayPulse={sim.triggerPulse}
              metrics={sim.metrics}
            />
          </div>

          <SimulationControls sim={sim} />
        </div>
      </div>
    </section>
  );
}
