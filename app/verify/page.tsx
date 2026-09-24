"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CassavaBatch } from "@/types/cassava";
import { decodeBatchFromUrlData } from "@/lib/utils";
import { BatchVerificationCard } from "@/components/BatchVerificationCard";
import { Navbar } from "@/components/Navbar";
import { QRScannerModal } from "@/components/QRScannerModal";
import { AlertCircle, ArrowLeft, RefreshCw, Sprout } from "lucide-react";
import { batchApi } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [batch, setBatch] = useState<CassavaBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveBatch() {
      const dataParam = searchParams.get("data");
      const idParam = searchParams.get("id");

      // 1. Try URL payload directly
      if (dataParam) {
        const decoded = decodeBatchFromUrlData(dataParam);
        if (decoded && decoded.variety) {
          if (!cancelled) {
            setBatch(decoded);
            setLoading(false);
          }
          return;
        }
      }

      // 2. Try Backend API lookup by ID
      if (idParam) {
        try {
          const remoteBatch = await batchApi.getBatchById(idParam);
          if (remoteBatch && !cancelled) {
            setBatch(remoteBatch);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Backend lookup failed, checking local storage:", e);
        }

        // 3. Fallback to localStorage
        try {
          const stored = localStorage.getItem("yucachain_batches");
          if (stored) {
            const list: CassavaBatch[] = JSON.parse(stored);
            const found = list.find((b) => b.id === idParam);
            if (found && !cancelled) {
              setBatch(found);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Local batch lookup failed:", e);
        }
      }

      if (!cancelled) {
        setError("No valid cassava batch record found for this verification code.");
        setLoading(false);
      }
    }

    resolveBatch();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700">Verifying YucaChain Batch Passport...</p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Verification Error</h2>
        <p className="text-sm text-slate-500 mt-2">{error || "Record could not be resolved."}</p>

        <div className="mt-6 flex flex-col space-y-2">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Go to YucaChain Generator
          </button>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Scan another QR Code
          </button>
        </div>

        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBatchScanned={(scanned) => {
            setBatch(scanned);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="py-8">
      <BatchVerificationCard
        batch={batch}
        onBack={() => router.push("/")}
      />
    </div>
  );
}

export default function VerifyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        activeTab="scanner"
        setActiveTab={(tab) => {
          if (tab === "register") router.push("/");
          if (tab === "history") router.push("/?tab=history");
        }}
        onOpenScanner={() => {}}
        batchCount={0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-700">Loading verification details...</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-2">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-800">YucaChain Traceability Engine</span>
          <span>•</span>
          <span>Verified Batch Verification Portal</span>
        </div>
      </footer>
    </div>
  );
}
