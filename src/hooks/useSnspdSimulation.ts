import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MATERIALS, type MaterialId, type MaterialPreset } from '../data/materials';
import {
  computeSnspdMetrics,
  generatePulseWaveform,
  evToWavelength,
  type SnspdMetrics,
  type WaveformPoint,
} from '../utils/physics';

export interface SnspdSimulationState {
  materialId: MaterialId;
  material: MaterialPreset;
  selectMaterialPreset: (nextId: MaterialId) => void;
  wavelengthNm: number;
  setWavelengthNm: (val: number) => void;
  setEnergyEv: (ev: number) => void;
  temperatureK: number;
  setTemperatureK: (val: number) => void;
  biasCurrentUa: number;
  setBiasCurrentUa: (val: number) => void;
  criticalCurrentOverrideUa: number | null;
  setCriticalCurrentOverrideUa: (val: number | null) => void;
  widthNm: number;
  setWidthNm: (val: number) => void;
  thicknessNm: number;
  setThicknessNm: (val: number) => void;
  metrics: SnspdMetrics;
  isRunning: boolean;
  timeScale: number;
  setTimeScale: (val: number) => void;
  windowNs: number;
  setWindowNs: (val: number) => void;
  simTimeNs: number;
  arrivalNs: number;
  pulseCount: number;
  visibleWaveform: WaveformPoint[];
  fullWaveform: WaveformPoint[];
  photonProgress: number;
  hotspotIntensity: number;
  currentDiversion: number;
  triggerPulse: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetGraph: () => void;
}

export function useSnspdSimulation(initialMaterial: MaterialId = 'NbN'): SnspdSimulationState {
  const defaultMat = MATERIALS[initialMaterial];

  const [materialId, setMaterialId] = useState<MaterialId>(initialMaterial);
  const [wavelengthNm, setWavelengthNm] = useState<number>(1550);
  const [temperatureK, setTemperatureK] = useState<number>(defaultMat.typicalOpTempK);
  const [biasCurrentUa, setBiasCurrentUa] = useState<number>(16.5);
  const [criticalCurrentOverrideUa, setCriticalCurrentOverrideUa] = useState<number | null>(null);
  const [widthNm, setWidthNm] = useState<number>(defaultMat.refWidthNm);
  const [thicknessNm, setThicknessNm] = useState<number>(defaultMat.refThicknessNm);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [windowNs, setWindowNs] = useState<number>(50);
  const [simTimeNs, setSimTimeNs] = useState<number>(0);
  const [pulseCount, setPulseCount] = useState<number>(0);

  const arrivalNs = 8;
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const material = MATERIALS[materialId] || MATERIALS.NbN;

  const selectMaterialPreset = useCallback((nextId: MaterialId) => {
    const nextMat = MATERIALS[nextId];
    if (!nextMat) return;
    setMaterialId(nextId);
    setTemperatureK(nextMat.typicalOpTempK);
    setWidthNm(nextMat.refWidthNm);
    setThicknessNm(nextMat.refThicknessNm);
    setCriticalCurrentOverrideUa(null);
    setBiasCurrentUa(Number((nextMat.refIcUa * 0.78).toFixed(1)));
  }, []);

  const setEnergyEv = useCallback((ev: number) => {
    const nextNm = Math.round(evToWavelength(ev));
    setWavelengthNm(Math.min(2500, Math.max(350, nextNm)));
  }, []);

  const metrics = useMemo(
    () =>
      computeSnspdMetrics({
        material,
        wavelengthNm,
        temperatureK,
        biasCurrentUa,
        criticalCurrentOverrideUa,
        widthNm,
        thicknessNm,
      }),
    [
      material,
      wavelengthNm,
      temperatureK,
      biasCurrentUa,
      criticalCurrentOverrideUa,
      widthNm,
      thicknessNm,
    ]
  );

  const fullWaveform = useMemo(
    () =>
      generatePulseWaveform({
        windowNs,
        arrivalNs,
        points: 140,
        biasCurrentUa,
        metrics,
      }),
    [windowNs, biasCurrentUa, metrics]
  );

  const visibleWaveform = useMemo(() => {
    if (simTimeNs <= 0 && !isRunning) {
      return fullWaveform.slice(0, 1);
    }
    return fullWaveform.filter((pt) => pt.timeNs <= simTimeNs + 0.01);
  }, [fullWaveform, simTimeNs, isRunning]);

  const photonProgress = useMemo(() => {
    if (simTimeNs <= 0) return 0;
    return Math.min(1, simTimeNs / arrivalNs);
  }, [simTimeNs, arrivalNs]);

  const hotspotIntensity = useMemo(() => {
    if (!metrics.canDetect || simTimeNs < arrivalNs) return 0;
    const dt = simTimeNs - arrivalNs;
    const decay = Math.max(metrics.fallTimeNs * 0.45, 2.5);
    return Math.exp(-dt / decay);
  }, [metrics.canDetect, metrics.fallTimeNs, simTimeNs, arrivalNs]);

  const currentDiversion = useMemo(() => {
    if (!metrics.canDetect || simTimeNs < arrivalNs) return 0;
    const dt = simTimeNs - arrivalNs;
    const rise = Math.max(metrics.riseTimeNs, 0.25);
    const fall = Math.max(metrics.fallTimeNs, 2.0);
    const val = Math.exp(-dt / fall) - Math.exp(-dt / rise);
    return Math.min(1, Math.max(0, val * 1.35));
  }, [metrics.canDetect, metrics.riseTimeNs, metrics.fallTimeNs, simTimeNs, arrivalNs]);

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = now;
      }
      const dtSec = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      setSimTimeNs((prev) => {
        const next = prev + dtSec * 12 * timeScale;
        if (next >= windowNs) {
          setIsRunning(false);
          return windowNs;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, timeScale, windowNs]);

  const triggerPulse = useCallback(() => {
    setSimTimeNs(0.05);
    setPulseCount((c) => c + 1);
    setIsRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const startSimulation = useCallback(() => {
    if (simTimeNs >= windowNs || simTimeNs === 0) {
      setSimTimeNs(0.05);
    }
    setIsRunning(true);
  }, [simTimeNs, windowNs]);

  const resetGraph = useCallback(() => {
    setIsRunning(false);
    setSimTimeNs(0);
  }, []);

  return {
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
    isRunning,
    timeScale,
    setTimeScale,
    windowNs,
    setWindowNs,
    simTimeNs,
    arrivalNs,
    pulseCount,
    visibleWaveform,
    fullWaveform,
    photonProgress,
    hotspotIntensity,
    currentDiversion,
    triggerPulse,
    startSimulation,
    stopSimulation,
    resetGraph,
  };
}
