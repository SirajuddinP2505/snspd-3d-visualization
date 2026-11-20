import React from 'react';
import { Sparkles } from 'lucide-react';
import { wavelengthToColor, wavelengthToEv } from '../utils/physics';

interface PhotonAnimationProps {
  wavelengthNm?: number;
  photonProgress?: number;
}

export default function PhotonAnimation({
  wavelengthNm = 1550,
  photonProgress = 0,
}: PhotonAnimationProps) {
  const energyEv = wavelengthToEv(wavelengthNm);
  const color = wavelengthToColor(wavelengthNm);
  const absorbed = photonProgress >= 0.99;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#091022] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Sparkles size={15} style={{ color }} />
          Single-Photon Wavepacket
        </span>
        <span className="font-mono text-xs tabular-nums text-sky-200">
          λ = {wavelengthNm} nm · E = {energyEv.toFixed(2)} eV
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${Math.round(photonProgress * 100)}%`,
            background: `linear-gradient(90deg, ${color}, #e0f2fe)`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {photonProgress === 0
          ? 'Awaiting photon emission from optical fiber.'
          : absorbed
            ? 'Photon absorbed — Cooper pair broken into excited quasiparticles.'
            : 'Photon propagating toward superconducting nanowire.'}
      </p>
    </div>
  );
}
