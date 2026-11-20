import React from 'react';
import { AlertTriangle, CheckCircle2, Sliders, XCircle } from 'lucide-react';
import { MATERIALS, type MaterialId } from '../data/materials';
import type { SnspdSimulationState } from '../hooks/useSnspdSimulation';

interface SimulationControlsProps {
  sim: SnspdSimulationState;
}

export default function SimulationControls({ sim }: SimulationControlsProps) {
  const {
    materialId,
    material,
    selectMaterialPreset,
    wavelengthNm,
    setWavelengthNm,
    setEnergyEv,
    temperatureK,
    setTemperatureK,
    biasCurrentUa,
    setBiasCurrentUa,
    criticalCurrentOverrideUa,
    setCriticalCurrentOverrideUa,
    widthNm,
    setWidthNm,
    thicknessNm,
    setThicknessNm,
    metrics,
  } = sim;

  const StatusIcon =
    metrics.regimeStatus === 'ready'
      ? CheckCircle2
      : metrics.regimeStatus === 'warn'
        ? AlertTriangle
        : XCircle;

  const statusTone =
    metrics.regimeStatus === 'ready'
      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
      : metrics.regimeStatus === 'warn'
        ? 'border-orange-500/40 bg-orange-500/15 text-orange-300'
        : 'border-rose-500/40 bg-rose-500/15 text-rose-300';

  return (
    <aside className="rounded-xl border border-slate-800 bg-[#091022] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-base font-bold text-slate-100">
          <Sliders size={17} className="text-cyan-400" />
          Parameter Simulator
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold ${statusTone}`}
        >
          <StatusIcon size={13} />
          {metrics.regime}
        </span>
      </div>

      {/* Material Presets */}
      <div className="mb-1.5 text-xs font-medium text-slate-400">
        Material Preset (Illustrative Values)
      </div>
      <div className="mb-2.5 grid grid-cols-3 gap-2">
        {(Object.keys(MATERIALS) as MaterialId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => selectMaterialPreset(id)}
            className={`whitespace-nowrap shrink-0 rounded-lg border px-3 py-2 font-mono text-xs font-semibold transition-colors ${
              materialId === id
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {id}
          </button>
        ))}
      </div>
      <p className="mb-5 text-xs leading-relaxed text-slate-400">
        {material.shortDesc} (Illustrative Tc ≈ {material.tcK} K)
      </p>

      {/* Wavelength */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="wavelength-slider" className="text-slate-300">
            Photon Wavelength (λ)
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {wavelengthNm} nm
          </span>
        </div>
        <input
          id="wavelength-slider"
          className="snspd-slider"
          type="range"
          min={400}
          max={2000}
          step={10}
          value={wavelengthNm}
          onChange={(e) => setWavelengthNm(Number(e.target.value))}
        />
      </div>

      {/* Photon Energy */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="energy-slider" className="text-slate-300">
            Photon Energy (E = hc/λ)
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {metrics.photonEnergyEv.toFixed(2)} eV
          </span>
        </div>
        <input
          id="energy-slider"
          className="snspd-slider"
          type="range"
          min={0.62}
          max={3.1}
          step={0.02}
          value={Number(metrics.photonEnergyEv.toFixed(2))}
          onChange={(e) => setEnergyEv(Number(e.target.value))}
        />
      </div>

      {/* Operating Temperature */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="temp-slider" className="text-slate-300">
            Operating Temperature (T)
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {temperatureK.toFixed(1)} K (Tc = {material.tcK} K)
          </span>
        </div>
        <input
          id="temp-slider"
          className="snspd-slider"
          type="range"
          min={0.4}
          max={12.0}
          step={0.1}
          value={temperatureK}
          onChange={(e) => setTemperatureK(Number(e.target.value))}
        />
      </div>

      {/* Bias Current */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="bias-slider" className="text-slate-300">
            Bias Current (IB)
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {biasCurrentUa.toFixed(1)} μA ({(metrics.biasRatio * 100).toFixed(0)}% Ic)
          </span>
        </div>
        <input
          id="bias-slider"
          className="snspd-slider"
          type="range"
          min={1}
          max={35}
          step={0.5}
          value={biasCurrentUa}
          onChange={(e) => setBiasCurrentUa(Number(e.target.value))}
        />
      </div>

      {/* Critical Current */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="ic-slider" className="text-slate-300">
            Critical Current Ic(T){' '}
            <span className="text-slate-500">
              {criticalCurrentOverrideUa === null ? '(Scaled)' : '(Manual)'}
            </span>
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {metrics.estimatedIcUa.toFixed(1)} μA
          </span>
        </div>
        <input
          id="ic-slider"
          className="snspd-slider"
          type="range"
          min={2}
          max={40}
          step={0.5}
          value={Number(metrics.estimatedIcUa.toFixed(1))}
          onChange={(e) => setCriticalCurrentOverrideUa(Number(e.target.value))}
        />
        {criticalCurrentOverrideUa !== null && (
          <button
            type="button"
            onClick={() => setCriticalCurrentOverrideUa(null)}
            className="mt-1.5 rounded border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
          >
            Reset to T-scaled Ic(T)
          </button>
        )}
      </div>

      {/* Nanowire Width */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="width-slider" className="text-slate-300">
            Nanowire Width (w)
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {widthNm} nm
          </span>
        </div>
        <input
          id="width-slider"
          className="snspd-slider"
          type="range"
          min={50}
          max={200}
          step={5}
          value={widthNm}
          onChange={(e) => setWidthNm(Number(e.target.value))}
        />
      </div>

      {/* Nanowire Thickness */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <label htmlFor="thick-slider" className="text-slate-300">
            Nanowire Thickness (d)
          </label>
          <span className="font-mono font-semibold tabular-nums text-cyan-300">
            {thicknessNm} nm
          </span>
        </div>
        <input
          id="thick-slider"
          className="snspd-slider"
          type="range"
          min={3}
          max={12}
          step={0.5}
          value={thicknessNm}
          onChange={(e) => setThicknessNm(Number(e.target.value))}
        />
      </div>

      {/* Conceptual Model Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-orange-500/35 bg-orange-500/10 p-3 text-xs leading-relaxed text-orange-200">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-400" />
        <div>
          <strong>Conceptual Model Notice:</strong> Values and thresholds use simplified
          phenomenological scaling for education. Real SNSPD detection exhibits stochastic
          timing jitter, vortex fluctuations, and fabrication-dependent constants.
        </div>
      </div>
    </aside>
  );
}
