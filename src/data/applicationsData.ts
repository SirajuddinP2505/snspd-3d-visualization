export interface ApplicationDomain {
  id: string;
  title: string;
  category: string;
  description: string;
  benefit: string;
}

export const APPLICATIONS: ApplicationDomain[] = [
  {
    id: 'qcomm',
    title: 'Quantum Communication',
    category: 'Quantum Networks',
    description:
      'Enables entanglement distribution and quantum repeaters over long optical fibers at telecom wavelengths (1310–1550 nm) where fiber attenuation is lowest.',
    benefit: 'High detection efficiency combined with negligible intrinsic dark counts maximizes link distance.',
  },
  {
    id: 'qkd',
    title: 'Quantum Key Distribution (QKD)',
    category: 'Cryptography',
    description:
      'Measures single-photon states in decoy-state BB84, twin-field, and entanglement-based QKD protocols to establish information-theoretically secure keys.',
    benefit: 'Low timing jitter permits high clock rates and tight temporal filtering against stray photons.',
  },
  {
    id: 'qoptics',
    title: 'Quantum Optics',
    category: 'Fundamental Physics',
    description:
      'Supports Hong–Ou–Mandel two-photon interference, Bell inequality tests, and characterization of single-photon emitters such as quantum dots.',
    benefit: 'Near-unity system detection efficiency helps close detection loopholes in foundational tests.',
  },
  {
    id: 'deepspace',
    title: 'Deep-Space Optical Communication',
    category: 'Aerospace',
    description:
      'Ground receivers use SNSPD arrays to count individual laser photons arriving from lunar or deep-space optical transceivers across millions of kilometers.',
    benefit: 'High photon-starved sensitivity and wide active areas capture weak atmospheric-distorted beams.',
  },
  {
    id: 'qcomputing',
    title: 'Quantum Computing Experiments',
    category: 'Quantum Processors',
    description:
      'Reads out photonic qubits in linear-optical quantum computing, Gaussian boson sampling, and optical state-readout of trapped-ion or spin qubits.',
    benefit: 'On-chip waveguide integration scales multi-channel single-photon detection.',
  },
  {
    id: 'biomedical',
    title: 'Biomedical Optical Research',
    category: 'Life Sciences',
    description:
      'Detects ultra-weak near-infrared fluorescence, singlet oxygen luminescence (~1270 nm), and diffuse correlation spectroscopy signals in tissue.',
    benefit: 'Mid-IR and NIR reach where silicon SPADs lose sensitivity.',
  },
  {
    id: 'photonics',
    title: 'Advanced Photonics & LiDAR',
    category: 'Metrology & Sensing',
    description:
      'Drives time-correlated single-photon LiDAR, optical time-domain reflectometry (OTDR), and infrared hot-carrier emission imaging for semiconductor failure analysis.',
    benefit: 'Picosecond timing resolution resolves millimeter-scale optical path differences.',
  },
];
