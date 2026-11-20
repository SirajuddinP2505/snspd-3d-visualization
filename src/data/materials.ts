export type MaterialId = 'NbN' | 'NbTiN' | 'WSi';

export interface MaterialPreset {
  id: MaterialId;
  name: string;
  shortDesc: string;
  tcK: number;
  typicalOpTempK: number;
  refWidthNm: number;
  refThicknessNm: number;
  refIcUa: number;
  refLkNh: number;
  highlight: string;
}

export const MATERIALS: Record<MaterialId, MaterialPreset> = {
  NbN: {
    id: 'NbN',
    name: 'Niobium Nitride (NbN)',
    shortDesc: 'Polycrystalline nitride film operated near 2–4 K with fast reset times.',
    tcK: 10.5,
    typicalOpTempK: 2.5,
    refWidthNm: 100,
    refThicknessNm: 6,
    refIcUa: 22,
    refLkNh: 350,
    highlight: 'Operates comfortably in closed-cycle 2.5–4 K cryocoolers.',
  },
  NbTiN: {
    id: 'NbTiN',
    name: 'Niobium Titanium Nitride (NbTiN)',
    shortDesc: 'Low-loss nitride alloy offering high system efficiency and low jitter near 2 K.',
    tcK: 11.2,
    typicalOpTempK: 2.2,
    refWidthNm: 100,
    refThicknessNm: 7,
    refIcUa: 25,
    refLkNh: 320,
    highlight: 'Frequently paired with optical cavities for high telecom-band efficiency.',
  },
  WSi: {
    id: 'WSi',
    name: 'Tungsten Silicide (WSi)',
    shortDesc: 'Amorphous silicide with lower Tc (~3.7 K) and low energy gap, sensitive into mid-IR.',
    tcK: 3.7,
    typicalOpTempK: 0.8,
    refWidthNm: 120,
    refThicknessNm: 5,
    refIcUa: 12,
    refLkNh: 550,
    highlight: 'Amorphous uniformity enables high internal efficiency at 1550 nm and beyond.',
  },
};
