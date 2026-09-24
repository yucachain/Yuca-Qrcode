import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CassavaBatch, CyanideSafetyLevel, MoistureStatus } from "@/types/cassava";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateBatchId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `YUCA-${year}-CS-${randomSuffix}`;
}

export function generateConsignmentId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CNS-${year}-${randomSuffix}`;
}

export function getCyanideSafety(cyanideMgPerKg: number): {
  level: CyanideSafetyLevel;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
} {
  if (cyanideMgPerKg <= 10) {
    return {
      level: "Safe (Consumption)",
      color: "text-emerald-700 dark:text-emerald-400",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
      badgeBorder: "border-emerald-200 dark:border-emerald-800",
      description: "Low cyanide content (< 10 mg/kg). Fully compliant with WHO & CODEX food safety standards for direct consumption.",
    };
  } else if (cyanideMgPerKg <= 50) {
    return {
      level: "Moderate (Processing Req.)",
      color: "text-amber-700 dark:text-amber-400",
      badgeBg: "bg-amber-50 dark:bg-amber-950/50",
      badgeBorder: "border-amber-200 dark:border-amber-800",
      description: "Moderate cyanide (10-50 mg/kg). Requires standard soaking, fermentation, or boiling before consumption.",
    };
  } else {
    return {
      level: "High (Industrial Only)",
      color: "text-rose-700 dark:text-rose-400",
      badgeBg: "bg-rose-50 dark:bg-rose-950/50",
      badgeBorder: "border-rose-200 dark:border-rose-800",
      description: "High cyanide (> 50 mg/kg). Bitter cassava variety suited primarily for industrial starch, ethanol, or extensive detoxification.",
    };
  }
}

export function getMoistureStatus(moisturePct: number): {
  status: MoistureStatus;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
} {
  if (moisturePct <= 13) {
    return {
      status: "Optimal",
      color: "text-emerald-700 dark:text-emerald-400",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
      badgeBorder: "border-emerald-200 dark:border-emerald-800",
      description: "Optimal storage moisture (<= 13%). High shelf-life stability and minimal mold risk in YucaHub.",
    };
  } else if (moisturePct <= 15) {
    return {
      status: "Moderate Moisture",
      color: "text-amber-700 dark:text-amber-400",
      badgeBg: "bg-amber-50 dark:bg-amber-950/50",
      badgeBorder: "border-amber-200 dark:border-amber-800",
      description: "Slightly elevated moisture (13-15%). Monitor ventilation and prioritize processing.",
    };
  } else {
    return {
      status: "High Moisture (Perishable)",
      color: "text-rose-700 dark:text-rose-400",
      badgeBg: "bg-rose-50 dark:bg-rose-950/50",
      badgeBorder: "border-rose-200 dark:border-rose-800",
      description: "High moisture (> 15%). Immediate drying or cold storage required to prevent fungal deterioration.",
    };
  }
}

export function calculateHubDuration(entryDate: string, exitDate: string): string {
  if (!entryDate || !exitDate) return "In Transit / Scheduled";

  const entry = new Date(entryDate);
  const exit = new Date(exitDate);

  if (isNaN(entry.getTime()) || isNaN(exit.getTime())) return "Unknown Duration";

  const diffMs = exit.getTime() - entry.getTime();
  if (diffMs < 0) return "Exit date is before entry date";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays === 0) {
    return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
  }
  if (diffHours === 0) {
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  }
  return `${diffDays} day${diffDays > 1 ? "s" : ""}, ${diffHours} hr${diffHours > 1 ? "s" : ""}`;
}

export function encodeBatchToUrlData(batch: CassavaBatch): string {
  try {
    const json = JSON.stringify(batch);
    if (typeof window !== "undefined") {
      return btoa(encodeURIComponent(json));
    }
    return Buffer.from(encodeURIComponent(json)).toString("base64");
  } catch (err) {
    console.error("Error encoding batch data:", err);
    return "";
  }
}

export function decodeBatchFromUrlData(encoded: string): CassavaBatch | null {
  try {
    let decodedJson: string;
    if (typeof window !== "undefined") {
      decodedJson = decodeURIComponent(atob(encoded));
    } else {
      decodedJson = decodeURIComponent(Buffer.from(encoded, "base64").toString("utf-8"));
    }
    return JSON.parse(decodedJson) as CassavaBatch;
  } catch (err) {
    console.error("Error decoding batch data:", err);
    return null;
  }
}

export const CASSAVA_VARIETIES = [
  { value: "TME 419", label: "TME 419 (High Yield, Low Cyanide)" },
  { value: "TMS 30572", label: "TMS 30572 (Pest Resistant, Versatile)" },
  { value: "Yellow Cassava (TMS 01/1368)", label: "Yellow Cassava (Vitamin A Biofortified)" },
  { value: "TMS 98/0505", label: "TMS 98/0505 (High Starch, Rapid Bulking)" },
  { value: "TMS 98/0581", label: "TMS 98/0581 (High Dry Matter)" },
  { value: "Oko-Iyawo", label: "Oko-Iyawo (Traditional Heritage Variety)" },
  { value: "Other", label: "Custom / Other Variety" },
];

export const YUCA_HUBS = [
  "YucaHub Eyenkorin, Ilorin City, Kwara State",
];
