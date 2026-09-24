import { CassavaBatch } from "@/types/cassava";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const STORAGE_KEY = "yucachain_batches";

// Helper: read fallback local batches
export function getLocalBatches(): CassavaBatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Error reading local batches:", err);
    return [];
  }
}

// Helper: save batch locally
export function saveLocalBatch(batch: CassavaBatch): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalBatches();
    const updated = [batch, ...list.filter((b) => b.id !== batch.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Error saving batch locally:", err);
  }
}

// Helper: remove batch locally
export function removeLocalBatch(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalBatches();
    const updated = list.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Error removing local batch:", err);
  }
}

export const batchApi = {
  /**
   * Fetch all batches from backend, falling back to localStorage if offline
   */
  async getBatches(params?: { search?: string; variety?: string }): Promise<CassavaBatch[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.variety) query.set("variety", params.variety);

      const url = `${API_BASE_URL}/batches${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const serverBatches: CassavaBatch[] = json.data || [];
        // Synchronize server batches to local storage cache
        if (typeof window !== "undefined" && serverBatches.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverBatches));
        }
        return serverBatches;
      }
    } catch (err) {
      console.warn("Backend API unreachable, using local storage fallback:", err);
    }
    return getLocalBatches();
  },

  /**
   * Fetch a single batch by ID from backend or fallback to localStorage
   */
  async getBatchById(id: string): Promise<CassavaBatch | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/batches/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (err) {
      console.warn("Backend API unreachable, checking local fallback:", err);
    }

    const localList = getLocalBatches();
    return localList.find((b) => b.id === id) || null;
  },

  /**
   * Register a new batch to backend
   */
  async createBatch(batch: CassavaBatch): Promise<CassavaBatch> {
    // Always persist locally first for immediate responsiveness
    saveLocalBatch(batch);

    try {
      const res = await fetch(`${API_BASE_URL}/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data || batch;
      }
    } catch (err) {
      console.warn("Could not sync batch to backend immediately:", err);
    }

    return batch;
  },

  /**
   * Delete batch by ID
   */
  async deleteBatch(id: string): Promise<boolean> {
    removeLocalBatch(id);

    try {
      const res = await fetch(`${API_BASE_URL}/batches/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch (err) {
      console.warn("Failed to delete from backend API:", err);
      return false;
    }
  },

  /**
   * Get batch statistics
   */
  async getStats(): Promise<{
    totalBatches: number;
    totalWeightKg: number;
    averageMoisturePct: number;
    averageCyanidePpm: number;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/batches/stats`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn("Could not fetch remote stats:", err);
    }

    // Fallback calculation from local storage
    const batches = getLocalBatches();
    const total = batches.length;
    const totalWeight = batches.reduce((acc, b) => acc + (b.weight || 0), 0);
    const avgMoisture =
      total > 0
        ? Number((batches.reduce((acc, b) => acc + (b.moistureContent || 0), 0) / total).toFixed(2))
        : 0;
    const avgCyanide =
      total > 0
        ? Number((batches.reduce((acc, b) => acc + (b.cyanideContent || 0), 0) / total).toFixed(2))
        : 0;

    return {
      totalBatches: total,
      totalWeightKg: totalWeight,
      averageMoisturePct: avgMoisture,
      averageCyanidePpm: avgCyanide,
    };
  },
};

export default batchApi;
