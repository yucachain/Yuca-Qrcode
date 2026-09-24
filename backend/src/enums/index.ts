// ============================================================
// YucaChain — Shared Enums
// Used across backend controllers, validation, and can be
// imported by the frontend too for type safety.
// ============================================================

export enum WeightUnit {
  KG = 'kg',
  TONNES = 'tonnes',
  BAGS = 'bags',
}

export enum AverageWeightUnit {
  KG = 'kg',
  G = 'g',
}

export enum CyanideSafetyLevel {
  SAFE = 'Safe (Consumption)',
  MODERATE = 'Moderate (Processing Req.)',
  HIGH = 'High (Industrial Only)',
}

export enum MoistureStatus {
  OPTIMAL = 'Optimal',
  MODERATE = 'Moderate Moisture',
  HIGH = 'High Moisture (Perishable)',
}

export enum HubLocation {
  EYENKORIN = 'YucaHub Eyenkorin, Ilorin City, Kwara State',
}

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}
