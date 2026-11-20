import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { WorkingStage } from '../data/stages';

interface StageNavigationProps {
  stages: WorkingStage[];
  currentIndex: number;
  onSelectStage: (index: number) => void;
  onReplay: () => void;
}

export default function StageNavigation({
  stages,
  currentIndex,
  onSelectStage,
  onReplay,
}: StageNavigationProps) {
  const progressPct = ((currentIndex + 1) / stages.length) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>Stage Progress</span>
        <span className="font-mono font-semibold tabular-nums text-cyan-300">
          Stage {currentIndex + 1} of {stages.length}
        </span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage, idx) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => onSelectStage(idx)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
              idx === currentIndex
                ? 'border-cyan-400 bg-cyan-500/15 text-slate-100'
                : 'border-slate-800 bg-[#091022] text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="font-mono text-[11px] opacity-80">0{stage.id}</div>
            <div className="mt-0.5 truncate text-xs font-semibold">{stage.shortLabel}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => onSelectStage(currentIndex - 1)}
          className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
        >
          <RotateCcw size={15} />
          Replay Stage Animation
        </button>

        <button
          type="button"
          disabled={currentIndex === stages.length - 1}
          onClick={() => onSelectStage(currentIndex + 1)}
          className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next Stage
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
