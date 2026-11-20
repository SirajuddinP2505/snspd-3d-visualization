import React, { useState } from 'react';
import { Eye, Layers, RotateCcw, Tag, X } from 'lucide-react';
import SnspdSceneCanvas, {
  type DetectorPartId,
  type ViewMode,
} from '../three/SnspdSceneCanvas';

const PART_INFO: Record<DetectorPartId, { title: string; description: string }> = {
  nanowire: {
    title: 'Meandering Superconducting Nanowire',
    description:
      'Ultrathin superconducting strip (typically 50–150 nm wide, 4–10 nm thick) patterned with rounded hairpin bends to maximize optical fill factor while mitigating bend current crowding.',
  },
  substrate: {
    title: 'Dielectric & Silicon Optical Substrate',
    description:
      'Provides mechanical support, thermal sinking of phonon heat into the cryostat, and (in cavity-integrated chips) enhanced optical absorption at target wavelengths.',
  },
  contacts: {
    title: 'Gold Electrical Contact Pads',
    description:
      'Low-resistance Au/Ti contact pads wire-bonded to external cryogenic coaxial cables for injecting the DC bias current IB and extracting picosecond/nanosecond voltage pulses.',
  },
  photonSource: {
    title: 'Optical Fiber Photon Source',
    description:
      'Single-mode optical fiber aligned above the active meander area delivering individual photons of energy E = hν = hc/λ.',
  },
  cryostat: {
    title: 'Cryogenic Cold Stage & Shield',
    description:
      'Maintains operating temperature T < Tc (typically 0.8–4 K) and shields the detector from room-temperature blackbody thermal radiation.',
  },
  readout: {
    title: 'Bias Tee & 50 Ω Readout Circuit',
    description:
      'Supplies steady DC bias current IB via an inductive port while routing fast AC voltage pulses V(t) across a 50 Ω load into a low-noise amplifier.',
  },
};

interface NanowireModelProps {
  wavelengthNm: number;
  widthNm: number;
  temperatureK: number;
  isSuperconducting: boolean;
  photonProgress: number;
  hotspotIntensity: number;
  currentDiversion: number;
}

export default function NanowireModel({
  wavelengthNm,
  widthNm,
  temperatureK,
  isSuperconducting,
  photonProgress,
  hotspotIntensity,
  currentDiversion,
}: NanowireModelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('macroscopic');
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPart, setSelectedPart] = useState<DetectorPartId | null>('nanowire');
  const [resetNonce, setResetNonce] = useState(0);

  const selectedInfo = selectedPart ? PART_INFO[selectedPart] : null;

  return (
    <div className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full overflow-hidden rounded-xl border border-slate-700/80 bg-[#040814]">
      {/* Top-Left / Top-Right minimal floating toolbar (no backdrop-blur over WebGL) */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#070d1c]/95 p-1">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'macroscopic'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => setViewMode('macroscopic')}
          >
            <Layers size={14} />
            Macroscopic
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'microscopic'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => setViewMode('microscopic')}
          >
            <Eye size={14} />
            Microscopic
          </button>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#070d1c]/95 p-1">
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              showLabels
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => setShowLabels((v) => !v)}
          >
            <Tag size={14} />
            Labels
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            onClick={() => setResetNonce((n) => n + 1)}
          >
            <RotateCcw size={14} />
            Reset Camera
          </button>
        </div>
      </div>

      {/* Interactive 3D Canvas */}
      <SnspdSceneCanvas
        viewMode={viewMode}
        resetNonce={resetNonce}
        wavelengthNm={wavelengthNm}
        widthNm={widthNm}
        temperatureK={temperatureK}
        isSuperconducting={isSuperconducting}
        photonProgress={photonProgress}
        hotspotIntensity={hotspotIntensity}
        currentDiversion={currentDiversion}
        selectedPart={selectedPart}
        onSelectPart={setSelectedPart}
        showLabels={showLabels}
        interactive={true}
      />

      {/* Bottom Component Inspector Drawer */}
      {selectedInfo && (
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-start justify-between gap-4 rounded-xl border border-slate-700/90 bg-[#060c1a]/95 p-3.5">
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-cyan-400">
              Selected Component · Click any 3D part to inspect
            </div>
            <div className="mt-0.5 text-sm font-semibold text-slate-100">
              {selectedInfo.title}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {selectedInfo.description}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close inspector"
            className="shrink-0 rounded-md border border-slate-700 p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            onClick={() => setSelectedPart(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
