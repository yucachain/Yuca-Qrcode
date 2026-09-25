"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CassavaBatch } from "@/types/cassava";
import { decodeBatchFromUrlData } from "@/lib/utils";
import { BatchVerificationCard } from "@/components/BatchVerificationCard";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { batchApi } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();

  const [batch, setBatch] = useState<CassavaBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationSource, setVerificationSource] = useState<"database" | "payload" | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveBatch() {
      const idParam = searchParams.get("id");
      const dataParam = searchParams.get("data");

      // 1. First priority: Check Live PostgreSQL Database via Render API
      if (idParam) {
        try {
          const remoteBatch = await batchApi.getBatchById(idParam);
          if (remoteBatch && !cancelled) {
            setBatch(remoteBatch);
            setVerificationSource("database");
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Live backend query delayed or unreachable, trying payload fallback:", e);
        }
      }

      // 2. Second priority: Decode immediate cryptographic QR payload
      if (dataParam) {
        const decoded = decodeBatchFromUrlData(dataParam);
        if (decoded && (decoded.id || decoded.consignmentId)) {
          if (!cancelled) {
            setBatch(decoded);
            setVerificationSource("payload");
            setLoading(false);
          }
          return;
        }
      }

      // 3. Third priority: Check local storage (if scanner opened on same browser)
      if (idParam) {
        try {
          const stored = localStorage.getItem("yucachain_batches");
          if (stored) {
            const list: CassavaBatch[] = JSON.parse(stored);
            const found = list.find((b) => b.id === idParam || b.consignmentId === idParam);
            if (found && !cancelled) {
              setBatch(found);
              setVerificationSource("payload");
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Local batch lookup failed:", e);
        }
      }

      if (!cancelled) {
        setError("No valid cassava batch record found for this QR code. The batch may have been removed or the QR code is invalid.");
        setLoading(false);
      }
    }

    resolveBatch();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const copyPageLink = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleShare = async () => {
    if (batch && navigator.share) {
      try {
        await navigator.share({
          title: `YucaChain Verified Batch - ${batch.consignmentId || batch.id}`,
          text: `Official Cassava Traceability Passport for ${batch.variety} (${batch.companyName}). Verified authentic.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share skipped", err);
      }
    } else {
      copyPageLink();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-base font-bold text-slate-800">Verifying Batch Passport</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Querying YucaChain registry and authenticating laboratory parameters...
        </p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Batch Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">{error}</p>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col space-y-2">
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Go to YucaChain Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 space-y-4">
      {/* Verification Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Verified Traceability Passport
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                {verificationSource === "database" ? "Live Database Verified" : "Authenticated Payload"}
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              This record is certified by the YucaHub intake facility at Eyenkorin, Ilorin.
            </p>
          </div>
        </div>

        {/* Quick Share / Copy actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto no-print">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/50 transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={copyPageLink}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/50 transition-colors shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Standalone Certified Batch Card (No generator tabs, no admin clutter) */}
      <BatchVerificationCard batch={batch} />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans">
      {/* Clean Dedicated Top Bar (NO Generator tabs, NO Admin forms) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Yucachain_Logo.png"
              alt="YucaChain Logo"
              className="h-9 w-auto object-contain"
            />
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-600">
              Batch Verification Portal
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              Official Verification
            </span>
          </div>
        </div>
      </header>

      {/* Main Verification Certificate Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-600">Loading passport details...</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </main>

      {/* Verification Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">YucaChain Traceability Engine</span>
            <span>•</span>
            <span>YucaHub Eyenkorin Facility</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Certified Cassava Quality & Traceability Passport
          </div>
        </div>
      </footer>
    </div>
  );
}
