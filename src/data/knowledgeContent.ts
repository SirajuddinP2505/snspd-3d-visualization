export interface KnowledgeTopic {
  id: string;
  title: string;
  summary: string;
  equation: string;
  explanation: string;
}

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: 'superconductivity',
    title: '01. What Is Superconductivity?',
    summary:
      'A quantum state of matter occurring below a material-specific critical temperature (Tc) where DC electrical resistance vanishes and magnetic flux is expelled.',
    equation: 'R = 0 Ω  for  T < Tc ,  I < Ic',
    explanation:
      'Unlike normal metals where electrons scatter off impurities and lattice vibrations, electrons in a superconductor condense into a coherent quantum ground state protected by an energy gap Δ.',
  },
  {
    id: 'cooper-pairs',
    title: '02. What Are Cooper Pairs?',
    summary:
      'Bound pairs of electrons with opposite spins and momenta formed via weak attractive interactions mediated by lattice vibrations (phonons).',
    equation: 'Binding energy ≈ 2Δ  (typically ~0.5–3 meV)',
    explanation:
      'Because Cooper pairs behave collectively as a bosonic condensate, they move coherently through the nanowire without dissipating energy until disrupted by thermal energy, excessive current, or photon absorption.',
  },
  {
    id: 'nanowire',
    title: '03. What Is a Superconducting Nanowire?',
    summary:
      'An ultrathin (typically 4–10 nm thick) and narrow (50–150 nm wide) superconducting strip patterned into a meandering active area.',
    equation: 'A_cross = w × d  (nanoscale cross-section)',
    explanation:
      'Making the strip nanoscale is essential: a single photon carries only ~0.8–2 eV of energy, so the wire volume must be tiny enough for one photon to perturb a substantial fraction of the cross-section.',
  },
  {
    id: 'single-photon',
    title: '04. What Is a Single Photon?',
    summary:
      'The smallest discrete quantum of electromagnetic radiation, carrying energy proportional to optical frequency and inversely proportional to wavelength.',
    equation: 'E = hν = hc / λ',
    explanation:
      'At telecommunications wavelength λ = 1550 nm, a single photon carries ~0.80 eV (~1.28 × 10⁻¹⁹ J)—far too small for many conventional room-temperature detectors without noise.',
  },
  {
    id: 'photon-absorption',
    title: '05. What Is Photon Absorption?',
    summary:
      'Transfer of the photon energy E to an electron in the superconducting film, breaking a Cooper pair and launching an excitation cascade.',
    equation: 'η_SDE = η_coupling × η_absorption × η_internal',
    explanation:
      'System detection efficiency depends on optical coupling into the cryostat, absorption inside the ultrathin film (often enhanced using optical cavities), and internal trigger probability.',
  },
  {
    id: 'quasiparticles',
    title: '06. What Are Quasiparticles?',
    summary:
      'Single-electron-like excitations created when Cooper pairs are broken above the superconducting energy gap Δ.',
    equation: 'N_qp ∝ E_photon / Δ',
    explanation:
      'Following photon absorption, rapid electron–electron and phonon scattering multiplies the number of excited quasiparticles over sub-picosecond to picosecond timescales.',
  },
  {
    id: 'hotspot',
    title: '07. What Is a Hotspot?',
    summary:
      'A localized nanometer-scale region where nonequilibrium quasiparticle density suppresses the superconducting order parameter.',
    equation: 'Δ(r) → 0  within hotspot radius r_hs',
    explanation:
      'Inside the hotspot, the material cannot sustain dissipationless supercurrent, forcing current to flow around the disturbed core.',
  },
  {
    id: 'current-crowding',
    title: '08. What Is Current Crowding?',
    summary:
      'Concentration of supercurrent streamlines around obstacles such as a photon-induced hotspot or sharp meander bends.',
    equation: 'J_local > J_c  ⇒  transition to resistive state',
    explanation:
      'Because current crowds into narrower superconducting side channels (or rounds tight corners), optimal rounded hairpin bends are engineered to prevent premature dark counts at bends.',
  },
  {
    id: 'snspd-mechanism',
    title: '09. How Does SNSPD Detection Work?',
    summary:
      'A bias-assisted electro-thermal instability converts a single absorbed photon into a macroscopic millivolt pulse.',
    equation: 'Hotspot + I_B → Resistive Barrier → V_pulse(t)',
    explanation:
      'Crucially, an SNSPD is not a semiconductor photodiode generating electron–hole pairs across a p–n junction; it operates via nonequilibrium suppression of superconductivity and circuit-coupled current diversion.',
  },
  {
    id: 'cryogenic-cooling',
    title: '10. Why Is Cryogenic Cooling Necessary?',
    summary:
      'Cryogenic operation (typically 0.8 K to 4 K) maintains T ≪ Tc and minimizes thermal fluctuations that cause false dark counts.',
    equation: 'k_B T ≪ Δ  (suppresses thermal pair-breaking)',
    explanation:
      'Closed-cycle Gifford–McMahon or sorption cryocoolers keep the nanowire stably superconducting without requiring daily liquid helium refills.',
  },
  {
    id: 'pros-cons',
    title: '11. Advantages and Limitations of SNSPDs',
    summary:
      'SNSPDs achieve industry-leading metrics simultaneously, balanced against cryogenic infrastructure requirements.',
    equation: 'High Efficiency (>90%) + Low Jitter (<20–150 ps) + Low DCR',
    explanation:
      'Advantages include broadband IR sensitivity, low dark counts, picosecond timing jitter, and free-running operation. Limitations include cryogenic cooling size/cost, polarization sensitivity in simple meanders, and kinetic-inductance reset time tradeoffs.',
  },
  {
    id: 'applications-summary',
    title: '12. Quantum & Scientific Impact',
    summary:
      'SNSPDs serve as core photon-counting instruments across quantum information science, astronomy, and biomedical optics.',
    equation: 'SNR_quantum ↑  via ultralow dark count rate',
    explanation:
      'Long-distance quantum key distribution, photonic quantum computing, deep-space laser links, and time-resolved spectroscopy rely on SNSPDs to detect faint single-photon signals.',
  },
];
