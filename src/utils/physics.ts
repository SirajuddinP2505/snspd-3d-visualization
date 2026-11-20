import type { MaterialPreset } from '../data/materials';

export const PLANCK_H = 6.62607015e-34; // J·s
export const SPEED_OF_LIGHT = 2.99792458e8; // m/s
export const ELEMENTARY_CHARGE = 1.602176634e-19; // C

export interface SnspdMetrics {
  photonEnergyEv: number;
  photonEnergyJ: number;
  estimatedIcUa: number;
  isSuperconducting: boolean;
  biasRatio: number;
  kineticInductanceNh: number;
  riseTimeNs: number;
  fallTimeNs: number;
  peakVoltageMv: number;
  loadResistanceOhm: number;
  hotspotResistanceOhm: number;
  regime: string;
  regimeStatus: 'ready' | 'warn' | 'error';
  canDetect: boolean;
  illustrativeThresholdBiasRatio: number;
}

export interface WaveformPoint {
  timeNs: number;
  voltageMv: number;
  currentUa: number;
}

/**
 * Convert wavelength in nm to photon energy in eV: E = hc / (e * lambda)
 */
export function wavelengthToEv(wavelengthNm: number): number {
  const lambdaMeters = Math.max(wavelengthNm, 1) * 1e-9;
  const joules = (PLANCK_H * SPEED_OF_LIGHT) / lambdaMeters;
  return joules / ELEMENTARY_CHARGE;
}

/**
 * Convert photon energy in eV to wavelength in nm.
 */
export function evToWavelength(energyEv: number): number {
  const clampedEv = Math.max(energyEv, 0.05);
  const joules = clampedEv * ELEMENTARY_CHARGE;
  const lambdaMeters = (PLANCK_H * SPEED_OF_LIGHT) / joules;
  return lambdaMeters * 1e9;
}

/**
 * Approximate visual RGB/hex representation for optical & NIR wavelengths.
 * NIR wavelengths (>760 nm) are mapped to calibrated laser cyan.
 */
export function wavelengthToColor(wavelengthNm: number): string {
  if (wavelengthNm < 450) return '#8b5cf6';
  if (wavelengthNm < 495) return '#3b82f6';
  if (wavelengthNm < 570) return '#10b981';
  if (wavelengthNm < 590) return '#eab308';
  if (wavelengthNm < 630) return '#f97316';
  if (wavelengthNm <= 760) return '#ef4444';
  return '#38bdf8';
}

/**
 * Illustrative phenomenological scaling for temperature-dependent critical current:
 * Ic(T) = Ic0 * [1 - (T/Tc)^2]^(3/2) for T < Tc.
 */
export function computeCriticalCurrent(
  material: MaterialPreset,
  temperatureK: number,
  widthNm: number,
  thicknessNm: number
): number {
  if (temperatureK >= material.tcK) return 0;
  const widthScale = widthNm / material.refWidthNm;
  const thicknessScale = thicknessNm / material.refThicknessNm;
  const baseIc0 = material.refIcUa * widthScale * thicknessScale;
  const reducedT = temperatureK / material.tcK;
  return baseIc0 * Math.pow(Math.max(0, 1 - reducedT * reducedT), 1.5);
}

/**
 * Computes illustrative SNSPD electrical and detection regime metrics.
 */
export function computeSnspdMetrics(params: {
  material: MaterialPreset;
  wavelengthNm: number;
  temperatureK: number;
  biasCurrentUa: number;
  criticalCurrentOverrideUa: number | null;
  widthNm: number;
  thicknessNm: number;
}): SnspdMetrics {
  const {
    material,
    wavelengthNm,
    temperatureK,
    biasCurrentUa,
    criticalCurrentOverrideUa,
    widthNm,
    thicknessNm,
  } = params;

  const photonEnergyEv = wavelengthToEv(wavelengthNm);
  const photonEnergyJ = photonEnergyEv * ELEMENTARY_CHARGE;
  const estimatedIcUa =
    criticalCurrentOverrideUa !== null
      ? criticalCurrentOverrideUa
      : computeCriticalCurrent(material, temperatureK, widthNm, thicknessNm);

  const isSuperconducting = temperatureK < material.tcK && estimatedIcUa > 0.2;
  const biasRatio = isSuperconducting && estimatedIcUa > 0 ? biasCurrentUa / estimatedIcUa : 0;

  // Kinetic inductance scales inversely with cross-sectional area
  const areaFactor =
    (material.refWidthNm * material.refThicknessNm) / Math.max(widthNm * thicknessNm, 50);
  const kineticInductanceNh = material.refLkNh * areaFactor;

  const loadResistanceOhm = 50;
  const hotspotResistanceOhm = 650;

  const fallTimeNs = kineticInductanceNh / loadResistanceOhm;
  const riseTimeNs = Math.max(0.15, kineticInductanceNh / (hotspotResistanceOhm + loadResistanceOhm));

  let regime = 'Detection Ready';
  let regimeStatus: 'ready' | 'warn' | 'error' = 'ready';
  let canDetect = true;

  const energyTerm = photonEnergyEv / 0.8;
  const widthPenalty = widthNm / 100;
  const illustrativeThresholdBiasRatio = Math.min(
    0.92,
    Math.max(0.28, 0.55 * (widthPenalty / Math.sqrt(energyTerm)))
  );

  if (!isSuperconducting) {
    regime = 'Normal State (T ≥ Tc)';
    regimeStatus = 'error';
    canDetect = false;
  } else if (biasCurrentUa >= estimatedIcUa) {
    regime = 'Bias Exceeds Ic (Latched)';
    regimeStatus = 'error';
    canDetect = false;
  } else if (biasRatio < illustrativeThresholdBiasRatio) {
    regime = 'Sub-Threshold (Low Margin)';
    regimeStatus = 'warn';
    canDetect = false;
  }

  const diversionFactor = canDetect ? 0.86 : 0;
  const peakVoltageMv = canDetect ? biasCurrentUa * 1e-6 * loadResistanceOhm * diversionFactor * 1e3 : 0;

  return {
    photonEnergyEv,
    photonEnergyJ,
    estimatedIcUa,
    isSuperconducting,
    biasRatio,
    kineticInductanceNh,
    riseTimeNs,
    fallTimeNs,
    peakVoltageMv,
    loadResistanceOhm,
    hotspotResistanceOhm,
    regime,
    regimeStatus,
    canDetect,
    illustrativeThresholdBiasRatio,
  };
}

/**
 * Generates an analytical oscilloscope waveform (voltage in mV, current in uA)
 * over [0, windowNs], with photon arrival at arrivalNs.
 */
export function generatePulseWaveform(params: {
  windowNs?: number;
  arrivalNs?: number;
  points?: number;
  biasCurrentUa?: number;
  metrics: SnspdMetrics;
}): WaveformPoint[] {
  const { windowNs = 50, arrivalNs = 8, points = 140, biasCurrentUa = 16, metrics } = params;
  const data: WaveformPoint[] = [];
  const { riseTimeNs, fallTimeNs, peakVoltageMv, loadResistanceOhm, canDetect } = metrics;

  for (let i = 0; i <= points; i += 1) {
    const t = (i / points) * windowNs;
    let voltageMv = 0;

    if (canDetect && t >= arrivalNs) {
      const dt = t - arrivalNs;
      const raw =
        Math.exp(-dt / Math.max(fallTimeNs, 0.5)) - Math.exp(-dt / Math.max(riseTimeNs, 0.1));
      const tPeak =
        ((riseTimeNs * fallTimeNs) / Math.max(fallTimeNs - riseTimeNs, 0.05)) *
        Math.log(fallTimeNs / Math.max(riseTimeNs, 0.05));
      const norm =
        Math.exp(-tPeak / Math.max(fallTimeNs, 0.5)) -
        Math.exp(-tPeak / Math.max(riseTimeNs, 0.1));
      voltageMv = norm > 1e-6 ? peakVoltageMv * (raw / norm) : 0;
      if (voltageMv < 0) voltageMv = 0;
    }

    const divertedUa = ((voltageMv * 1e-3) / loadResistanceOhm) * 1e6;
    const nanowireCurrentUa = metrics.isSuperconducting
      ? Math.max(0, biasCurrentUa - divertedUa)
      : 0;

    data.push({
      timeNs: Number(t.toFixed(2)),
      voltageMv: Number(voltageMv.toFixed(3)),
      currentUa: Number(nanowireCurrentUa.toFixed(2)),
    });
  }

  return data;
}
