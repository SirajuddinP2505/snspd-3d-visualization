import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Play, Square, RotateCcw, Zap } from 'lucide-react';
import type { SnspdMetrics, WaveformPoint } from '../utils/physics';

interface OscilloscopeProps {
  visibleWaveform: WaveformPoint[];
  windowNs: number;
  setWindowNs: (val: number) => void;
  isRunning: boolean;
  timeScale: number;
  setTimeScale: (val: number) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onReplayPulse: () => void;
  metrics: SnspdMetrics;
}

export default function Oscilloscope({
  visibleWaveform,
  windowNs,
  setWindowNs,
  isRunning,
  timeScale,
  setTimeScale,
  onStart,
  onStop,
  onReset,
  onReplayPulse,
  metrics,
}: OscilloscopeProps) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-[#060c1b] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] font-medium text-cyan-400">
            Electrical Signal Analysis · 50 Ω Coaxial Readout
          </div>
          <h3 className="mt-0.5 text-lg font-bold text-slate-100">
            Transient Detection Pulse &amp; Nanowire Current
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onReplayPulse}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-orange-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-500"
          >
            <Zap size={14} />
            Fire Photon / Replay Pulse
          </button>
          {!isRunning ? (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <Play size={14} />
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <Square size={14} />
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* Time Scale & Window Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Playback Speed:</span>
          {[0.5, 1, 2, 4].map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => setTimeScale(scale)}
              className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 font-mono transition-colors ${
                timeScale === scale
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              {scale}×
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Time Window:</span>
          {[25, 50, 100].map((win) => (
            <button
              key={win}
              type="button"
              onClick={() => setWindowNs(win)}
              className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 font-mono transition-colors ${
                windowNs === win
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              {win} ns
            </button>
          ))}
        </div>
      </div>

      {/* Oscilloscope Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer>
          <ComposedChart
            data={visibleWaveform}
            margin={{ top: 10, right: 16, left: 0, bottom: 18 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
            <XAxis
              dataKey="timeNs"
              type="number"
              domain={[0, windowNs]}
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
              label={{
                value: 'Time (ns)',
                position: 'insideBottom',
                offset: -10,
                fill: '#94a3b8',
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="left"
              stroke="#fb923c"
              tick={{ fontSize: 11 }}
              label={{
                value: 'Voltage (mV)',
                angle: -90,
                position: 'insideLeft',
                fill: '#fb923c',
                fontSize: 12,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#22d3ee"
              tick={{ fontSize: 11 }}
              label={{
                value: 'Current (μA)',
                angle: 90,
                position: 'insideRight',
                fill: '#22d3ee',
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#091124',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend verticalAlign="top" height={30} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="voltageMv"
              name="Detector Pulse V(t) [mV]"
              stroke="#fb923c"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="currentUa"
              name="Nanowire Current Inw(t) [μA]"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Tabular Readout Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-[#0a1224] px-3 py-2.5">
          <div className="font-mono text-sm font-bold tabular-nums text-cyan-300">
            {metrics.peakVoltageMv.toFixed(2)}{' '}
            <span className="text-[11px] font-normal text-slate-400">mV</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Pre-LNA Peak V</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0a1224] px-3 py-2.5">
          <div className="font-mono text-sm font-bold tabular-nums text-cyan-300">
            {metrics.riseTimeNs.toFixed(2)}{' '}
            <span className="text-[11px] font-normal text-slate-400">ns</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Rise Time τ_rise</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0a1224] px-3 py-2.5">
          <div className="font-mono text-sm font-bold tabular-nums text-cyan-300">
            {metrics.fallTimeNs.toFixed(1)}{' '}
            <span className="text-[11px] font-normal text-slate-400">ns</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Decay τ_fall ≈ Lk/RL</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0a1224] px-3 py-2.5">
          <div className="font-mono text-sm font-bold tabular-nums text-cyan-300">
            {metrics.kineticInductanceNh.toFixed(0)}{' '}
            <span className="text-[11px] font-normal text-slate-400">nH</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Kinetic Inductance</div>
        </div>
      </div>
    </div>
  );
}
