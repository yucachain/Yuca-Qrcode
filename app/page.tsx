"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { CassavaForm } from "@/components/CassavaForm";
import { QRCodeCard } from "@/components/QRCodeCard";
import { QRScannerModal } from "@/components/QRScannerModal";
import { BatchVerificationCard } from "@/components/BatchVerificationCard";
import { RecentBatches } from "@/components/RecentBatches";
import { CassavaBatch } from "@/types/cassava";
import {
  QrCode,
  ShieldCheck,
  Sprout,
  ScanLine,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { batchApi } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"register" | "scanner" | "history">("register");
  const [currentBatch, setCurrentBatch] = useState<CassavaBatch | null>(null);
  const [verifiedBatch, setVerifiedBatch] = useState<CassavaBatch | null>(null);
  const [savedBatches, setSavedBatches] = useState<CassavaBatch[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load saved batches from backend API on mount
  useEffect(() => {
    let mounted = true;
    async function loadBatches() {
      setIsSyncing(true);
      try {
        const list = await batchApi.getBatches();
        if (mounted) {
          setSavedBatches(list);
        }
      } catch (e) {
        console.error("Failed to load batches from API:", e);
      } finally {
        if (mounted) setIsSyncing(false);
      }
    }
    loadBatches();
    return () => {
      mounted = false;
    };
  }, []);

  // Save batch to backend API & state
  const saveBatch = async (batch: CassavaBatch) => {
    // Optimistic UI update
    setSavedBatches((prev) => {
      const filtered = prev.filter((b) => b.id !== batch.id);
      return [batch, ...filtered];
    });

    try {
      const saved = await batchApi.createBatch(batch);
      setSavedBatches((prev) => {
        const filtered = prev.filter((b) => b.id !== saved.id);
        return [saved, ...filtered];
      });
    } catch (e) {
      console.error("Failed to persist batch to backend:", e);
    }
  };

  // Handle generation from CassavaForm
  const handleBatchGenerated = async (batch: CassavaBatch) => {
    setCurrentBatch(batch);
    setVerifiedBatch(null);
    await saveBatch(batch);

    // Smooth scroll to QR display on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        const qrEl = document.getElementById("qr-section");
        qrEl?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  // Handle QR scanned via camera or file upload
  const handleBatchScanned = async (scannedBatch: CassavaBatch) => {
    setVerifiedBatch(scannedBatch);
    await saveBatch(scannedBatch);
    setActiveTab("register");
  };

  // Delete batch
  const handleDeleteBatch = async (id: string) => {
    // Optimistic removal
    setSavedBatches((prev) => prev.filter((b) => b.id !== id));
    if (currentBatch?.id === id) setCurrentBatch(null);
    if (verifiedBatch?.id === id) setVerifiedBatch(null);

    try {
      await batchApi.deleteBatch(id);
    } catch (e) {
      console.error("Failed to delete batch via API:", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "scanner") setIsScannerOpen(true);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        batchCount={savedBatches.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* If user scanned a QR code, show the certified batch view */}
        {verifiedBatch ? (
          <BatchVerificationCard
            batch={verifiedBatch}
            onBack={() => setVerifiedBatch(null)}
          />
        ) : activeTab === "history" ? (
          <RecentBatches
            batches={savedBatches}
            onSelectBatch={(b) => {
              setCurrentBatch(b);
              setActiveTab("register");
            }}
            onDeleteBatch={handleDeleteBatch}
          />
        ) : (
          <div>
            {/* Hero Subtitle */}
            <div className="mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Smart Agri-Traceability Protocol</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Cassava Batch QR Generator & Certification
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
                Log intake parameters, laboratory metrics, and YucaHub tracking dates to generate tamper-proof QR passports for instant verification.
              </p>
            </div>

            {/* Split Grid: Form on Left, QR Output on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form (7 cols) */}
              <div className="lg:col-span-7">
                <CassavaForm onGenerate={handleBatchGenerated} />
              </div>

              {/* Right Column: QR Code Display or Placeholder (5 cols) */}
              <div id="qr-section" className="lg:col-span-5 lg:sticky lg:top-20">
                {currentBatch ? (
                  <QRCodeCard batch={currentBatch} />
                ) : (
                  /* Placeholder when no QR generated yet */
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center relative overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3.5 border border-emerald-100">
                      <QrCode className="w-7 h-7 text-emerald-600" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      Ready to Generate Passport
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
                      Fill in the consignment ID, cassava metrics, and YucaHub dates on the left, then click <strong>Generate YucaChain QR Code</strong>.
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-left space-y-2">
                      <div className="flex items-start space-x-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Instant scan via smartphone camera or barcode gun</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>High-res printable badge and passport download</span>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Built-in native device sharing & verification link</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-2">
                      <button
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full py-2 px-3 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Scan existing QR Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Yucachain_Logo.png"
              alt="YucaChain Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="text-slate-300">•</span>
            <span>YucaHub Eyenkorin, Ilorin City, Kwara State</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by YucaChain Traceability Engine • Instant QR Passport
          </div>
        </div>
      </footer>

      {/* QR Scanner Modal (Live Camera / File Upload) */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBatchScanned={handleBatchScanned}
      />
    </div>
  );
}
