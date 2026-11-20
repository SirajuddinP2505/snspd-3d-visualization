import React from 'react';
import { Flame } from 'lucide-react';

interface HotspotAnimationProps {
  hotspotIntensity?: number;
  canDetect?: boolean;
}

export default function HotspotAnimation({
  hotspotIntensity = 0,
  canDetect = true,
}: HotspotAnimationProps) {
  const pct = Math.round(hotspotIntensity * 100);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#091022] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Flame size={15} className="text-orange-400" />
          Localized Hotspot &amp; Gap Suppression
        </span>
        <span className="font-mono text-xs tabular-nums text-orange-300">
          {pct}% excitation
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {!canDetect
          ? 'Current bias or temperature is outside the single-photon detection regime.'
          : hotspotIntensity > 0.25
            ? 'Resistive normal core active — supercurrent diverted around barrier.'
            : 'Superconducting condensate intact (no active hotspot).'}
      </p>
    </div>
  );
}
