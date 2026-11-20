export interface WorkingStage {
  id: number;
  title: string;
  shortLabel: string;
  subtitle: string;
  summary: string;
  details: string;
  equation: string;
  keyPoint: string;
}

export const WORKING_STAGES: WorkingStage[] = [
  {
    id: 1,
    title: 'Superconducting State',
    shortLabel: 'Superconducting',
    subtitle: 'Zero-resistance Cooper pair condensate below Tc',
    summary:
      'The ultrathin nanowire is cooled below its critical temperature (T < Tc) and biased with a DC current IB just below its critical current Ic.',
    details:
      'Electrons bind into Cooper pairs mediated by lattice phonons, forming a macroscopic quantum condensate. Current flows without DC electrical resistance or voltage drop across the nanowire.',
    equation: 'T < Tc ,   IB < Ic(T) ,   V_dc = 0 V',
    keyPoint: 'Cooper pairs carry the bias supercurrent smoothly along the meandering nanowire.',
  },
  {
    id: 2,
    title: 'Photon Arrival',
    shortLabel: 'Photon Arrival',
    subtitle: 'Single-photon wavepacket coupling into the nanowire',
    summary:
      'A single photon of energy E = hν = hc/λ arrives from the optical fiber and is absorbed by an electron inside the superconducting film.',
    details:
      'Even a single near-infrared photon (~0.8 eV at λ = 1550 nm) carries hundreds of times more energy than the superconducting energy gap Δ (typically ~0.5–2 meV), breaking a Cooper pair upon absorption.',
    equation: 'E = hν = hc / λ  ≫  2Δ',
    keyPoint: 'Absorption excites a high-energy electron well above the superconducting gap.',
  },
  {
    id: 3,
    title: 'Hotspot Formation',
    shortLabel: 'Hotspot',
    subtitle: 'Quasiparticle cascade and local gap suppression',
    summary:
      'Through electron–electron and electron–phonon scattering, the excited electron generates a cloud of nonequilibrium quasiparticles, locally suppressing superconductivity.',
    details:
      'Within picoseconds, a nanometer-scale resistive region—known as a hotspot—forms at the absorption site where the superconducting order parameter is strongly depleted.',
    equation: 'n_qp(r, t) ↑  ⇒  Δ(r, t) → 0  (Localized Normal Core)',
    keyPoint: 'A localized resistive hotspot grows inside the superconducting strip.',
  },
  {
    id: 4,
    title: 'Current Redistribution',
    shortLabel: 'Current Crowding',
    subtitle: 'Supercurrent deflection & resistive barrier formation',
    summary:
      'Supercurrent detours around the resistive hotspot into the remaining superconducting side channels, raising local current density.',
    details:
      'Current crowding pushes the local current density in the side channels above the critical current density Jc (or promotes vortex-assisted phase slips), causing a resistive normal barrier to span the entire nanowire width.',
    equation: 'J_side(t) > J_c  ⇒  R_nanowire : 0 → R_n',
    keyPoint: 'Diverted supercurrent exceeds critical density, switching the cross-section resistive.',
  },
  {
    id: 5,
    title: 'Electrical Pulse Generation',
    shortLabel: 'Voltage Pulse',
    subtitle: 'Current diversion into the 50 Ω readout circuit',
    summary:
      'Once a resistive barrier spans the wire, bias current diverts out of the high-impedance nanowire into the parallel 50 Ω coaxial readout line.',
    details:
      'This rapid current diversion produces a measurable transient voltage pulse V(t) across the load resistance, amplified by a cryogenic or room-temperature low-noise amplifier for single-photon counting.',
    equation: 'V_out(t) ≈ I_diverted(t) · R_L ,   τ_rise ≈ L_k / (R_n + R_L)',
    keyPoint: 'The 3D hotspot barrier triggers a sharp voltage spike on the oscilloscope.',
  },
  {
    id: 6,
    title: 'Detector Recovery',
    shortLabel: 'Recovery',
    subtitle: 'Thermal relaxation & kinetic-inductance reset',
    summary:
      'With current diverted away from the nanowire, Joule heating ceases; phonons carry excess heat into the cryogenic substrate and superconductivity heals.',
    details:
      'Current then flows back into the nanowire at a rate governed by its large kinetic inductance Lk and the readout load RL. Once current returns near IB, the detector is ready for the next photon.',
    equation: 'τ_recovery ≈ L_k / R_L ,   I_nw(t) → I_B',
    keyPoint: 'Hotspot disappears and supercurrent re-arms the nanowire on a nanosecond timescale.',
  },
];
