import type { DimensionScores } from './dimensions';

/** Six-dimension weights per course (sum = 1). Used for profile matching. */
export const courseProfiles: Record<string, DimensionScores> = {
  // Bachelor
  BCP: { TEC: 0.05, BUS: 0.05, CRE: 0.05, COM: 0.25, LAN: 0.10, CAR: 0.50 },
  BBA: { TEC: 0.10, BUS: 0.55, CRE: 0.05, COM: 0.15, LAN: 0.05, CAR: 0.10 },
  BTCSL: { TEC: 0.05, BUS: 0.05, CRE: 0.05, COM: 0.20, LAN: 0.45, CAR: 0.20 },
  BECE: { TEC: 0.05, BUS: 0.05, CRE: 0.10, COM: 0.15, LAN: 0.10, CAR: 0.55 },
  BFA: { TEC: 0.15, BUS: 0.50, CRE: 0.05, COM: 0.10, LAN: 0.05, CAR: 0.15 },
  BCL: { TEC: 0.05, BUS: 0.05, CRE: 0.15, COM: 0.20, LAN: 0.50, CAR: 0.05 },
  BVC: { TEC: 0.15, BUS: 0.05, CRE: 0.55, COM: 0.15, LAN: 0.05, CAR: 0.05 },
  BSE: { TEC: 0.70, BUS: 0.10, CRE: 0.05, COM: 0.05, LAN: 0.05, CAR: 0.05 },
  BIM: { TEC: 0.05, BUS: 0.40, CRE: 0.10, COM: 0.35, LAN: 0.05, CAR: 0.05 },
  BCS: { TEC: 0.75, BUS: 0.05, CRE: 0.05, COM: 0.05, LAN: 0.05, CAR: 0.05 },
  BMS: { TEC: 0.05, BUS: 0.15, CRE: 0.25, COM: 0.45, LAN: 0.05, CAR: 0.05 },
  BIP: { TEC: 0.20, BUS: 0.05, CRE: 0.05, COM: 0.15, LAN: 0.10, CAR: 0.45 },
  BFI: { TEC: 0.20, BUS: 0.55, CRE: 0.05, COM: 0.10, LAN: 0.05, CAR: 0.05 },
  BCA: { TEC: 0.10, BUS: 0.05, CRE: 0.50, COM: 0.25, LAN: 0.05, CAR: 0.05 },
  // Foundation — balanced exploration
  FCC: { TEC: 0.05, BUS: 0.10, CRE: 0.10, COM: 0.25, LAN: 0.40, CAR: 0.10 },
  FIA: { TEC: 0.15, BUS: 0.20, CRE: 0.15, COM: 0.15, LAN: 0.15, CAR: 0.20 },
  // Diploma
  DBA: { TEC: 0.10, BUS: 0.55, CRE: 0.05, COM: 0.15, LAN: 0.05, CAR: 0.10 },
  DAC: { TEC: 0.15, BUS: 0.55, CRE: 0.05, COM: 0.10, LAN: 0.05, CAR: 0.10 },
  DIT: { TEC: 0.70, BUS: 0.05, CRE: 0.05, COM: 0.05, LAN: 0.05, CAR: 0.10 },
  DMS: { TEC: 0.05, BUS: 0.10, CRE: 0.20, COM: 0.50, LAN: 0.10, CAR: 0.05 },
  DVA: { TEC: 0.05, BUS: 0.05, CRE: 0.65, COM: 0.10, LAN: 0.10, CAR: 0.05 },
  DGD: { TEC: 0.10, BUS: 0.05, CRE: 0.60, COM: 0.15, LAN: 0.05, CAR: 0.05 },
  DID: { TEC: 0.10, BUS: 0.05, CRE: 0.60, COM: 0.10, LAN: 0.05, CAR: 0.10 },
  TCSL: { TEC: 0.05, BUS: 0.05, CRE: 0.05, COM: 0.20, LAN: 0.45, CAR: 0.20 },
  ECE: { TEC: 0.05, BUS: 0.05, CRE: 0.10, COM: 0.15, LAN: 0.10, CAR: 0.55 },
  DIM: { TEC: 0.05, BUS: 0.40, CRE: 0.10, COM: 0.35, LAN: 0.05, CAR: 0.05 },
  DCS: { TEC: 0.70, BUS: 0.05, CRE: 0.05, COM: 0.05, LAN: 0.05, CAR: 0.10 },
  DMD: { TEC: 0.30, BUS: 0.05, CRE: 0.45, COM: 0.10, LAN: 0.05, CAR: 0.05 },
  DPA: { TEC: 0.05, BUS: 0.05, CRE: 0.45, COM: 0.35, LAN: 0.05, CAR: 0.05 },
  DECM: { TEC: 0.05, BUS: 0.10, CRE: 0.05, COM: 0.15, LAN: 0.10, CAR: 0.55 },
};
