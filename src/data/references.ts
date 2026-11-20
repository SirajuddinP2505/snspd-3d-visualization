export interface ScientificReference {
  authors: string;
  year: number;
  title: string;
  journal: string;
  volume: string;
  doi: string;
  url: string;
}

export const SCIENTIFIC_REFERENCES: ScientificReference[] = [
  {
    authors:
      "G. N. Gol'tsman, O. Okunev, G. Chulkova, A. Lipatov, A. Semenov, K. Smirnov, B. Voronov, A. Dzardanov, C. Williams, and R. Sobolewski",
    year: 2001,
    title: 'Picosecond superconducting single-photon optical detector',
    journal: 'Applied Physics Letters',
    volume: '79 (6), 705–707',
    doi: '10.1063/1.1388868',
    url: 'https://doi.org/10.1063/1.1388868',
  },
  {
    authors:
      'A. J. Kerman, E. A. Dauler, W. E. Keicher, J. K. W. Yang, K. K. Berggren, G. Gol’tsman, and B. Voronov',
    year: 2006,
    title: 'Kinetic-inductance-limited reset time of superconducting nanowire photon counters',
    journal: 'Applied Physics Letters',
    volume: '88 (11), 111116',
    doi: '10.1063/1.2183810',
    url: 'https://doi.org/10.1063/1.2183810',
  },
  {
    authors: 'J. R. Clem and K. K. Berggren',
    year: 2011,
    title: 'Geometry-dependent critical currents in superconducting nanocircuits',
    journal: 'Physical Review B',
    volume: '84 (17), 174510',
    doi: '10.1103/PhysRevB.84.174510',
    url: 'https://doi.org/10.1103/PhysRevB.84.174510',
  },
  {
    authors: 'C. M. Natarajan, M. G. Tanner, and R. H. Hadfield',
    year: 2012,
    title: 'Superconducting nanowire single-photon detectors: physics and applications',
    journal: 'Superconductor Science and Technology',
    volume: '25 (6), 063001',
    doi: '10.1088/0953-2048/25/6/063001',
    url: 'https://doi.org/10.1088/0953-2048/25/6/063001',
  },
  {
    authors:
      'F. Marsili, V. B. Verma, J. A. Stern, S. Harrington, A. E. Lita, T. Gerrits, I. Vayshenker, B. Baek, M. D. Shaw, R. P. Mirin, and S. W. Nam',
    year: 2013,
    title: 'Detecting single infrared photons with 93% system efficiency',
    journal: 'Nature Photonics',
    volume: '7 (3), 210–214',
    doi: '10.1038/nphoton.2013.13',
    url: 'https://doi.org/10.1038/nphoton.2013.13',
  },
  {
    authors:
      'I. Esmaeil Zadeh, J. Chang, J. W. N. Los, S. Gyger, A. W. Elshaari, S. Steinhauer, S. N. Dorenbos, and V. Zwiller',
    year: 2021,
    title:
      'Superconducting nanowire single-photon detectors: A perspective on evolution, state-of-the-art, future developments, and applications',
    journal: 'Applied Physics Letters',
    volume: '118 (19), 190502',
    doi: '10.1063/5.0045990',
    url: 'https://doi.org/10.1063/5.0045990',
  },
];
