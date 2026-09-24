export interface CassavaBatch {
  id: string; // Unique Batch ID e.g. YUCA-2026-CS-8291
  consignmentId: string; // e.g. CNS-2026-8491
  companyName: string; // "YucaChain"
  variety: string; // e.g. "TME 419", "TMS 30572", "Yellow Cassava (TMS 01/1368)"
  moistureContent: number; // in %
  cyanideContent: number; // in mg HCN/kg (ppm)
  weight: number; // Total batch weight
  weightUnit: "kg" | "tonnes" | "bags";
  averageWeight: number; // Average weight of the cassava root/tuber
  averageWeightUnit: "kg" | "g";
  entryDate: string; // ISO string or YYYY-MM-DD
  exitDate: string; // ISO string or YYYY-MM-DD
  hubLocation: string; // e.g. "YucaHub Eyenkorin, Ilorin City, Kwara State"
  qualityGrade?: string;
  remark?: string;
  notes?: string;
  farmerOrSupplier?: string;
  inspectorName?: string;
  createdAt: string;
}

export type CyanideSafetyLevel = "Safe (Consumption)" | "Moderate (Processing Req.)" | "High (Industrial Only)";
export type MoistureStatus = "Optimal" | "Moderate Moisture" | "High Moisture (Perishable)";

