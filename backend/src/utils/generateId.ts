// ============================================================
// YucaChain — ID Generation Utilities
// Mirrors the logic from the frontend lib/utils.ts
// ============================================================

/**
 * Generates a unique Batch ID.
 * Format: YUCA-{YEAR}-CS-{4-digit random}
 * Example: YUCA-2026-CS-8291
 */
export function generateBatchId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `YUCA-${year}-CS-${randomSuffix}`;
}

/**
 * Generates a unique Consignment ID.
 * Format: CNS-{YEAR}-{4-digit random}
 * Example: CNS-2026-4832
 */
export function generateConsignmentId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CNS-${year}-${randomSuffix}`;
}
