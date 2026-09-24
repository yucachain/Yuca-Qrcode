"use client";

import React from "react";
import {
  ShieldCheck,
  Sprout,
  Droplet,
  FlaskConical,
  Weight,
  Calendar,
  Building2,
  MapPin,
  CheckCircle,
  Printer,
  ArrowLeft,
  FileCheck,
  Hash,
  Scale,
  FileText,
} from "lucide-react";
import { CassavaBatch } from "@/types/cassava";
import {
  getCyanideSafety,
  getMoistureStatus,
  calculateHubDuration,
} from "@/lib/utils";

interface BatchVerificationCardProps {
  batch: CassavaBatch;
  onBack?: () => void;
}

export const BatchVerificationCard: React.FC<BatchVerificationCardProps> = ({
  batch,
  onBack,
}) => {
  const cyanideSafety = getCyanideSafety(batch.cyanideContent);
  const moistureStatus = getMoistureStatus(batch.moistureContent);
  const hubDuration = calculateHubDuration(batch.entryDate, batch.exitDate);

  const entryFormatted = new Date(batch.entryDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const exitFormatted = new Date(batch.exitDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Generator
        </button>
      )}

      {/* Main Certificate Card */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
        {/* Verification Banner */}
        <div className="yuca-gradient p-4 sm:p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Yucachain_Logo.png"
                alt="YucaChain"
                className="h-10 w-auto bg-white/95 px-2 py-1 rounded-lg"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Batch Verified: {batch.consignmentId || batch.id}
                </h1>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Cassava intake record registered at {batch.hubLocation}.
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto bg-white text-emerald-900 px-3 py-1.5 rounded-xl shadow-sm flex items-center space-x-1.5 font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Certified Authentic</span>
            </div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-5 space-y-5">
          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Operating Entity
              </span>
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-slate-900">{batch.companyName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Consignment ID
              </span>
              <div className="flex items-center space-x-1.5">
                <Hash className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-mono font-bold text-slate-900">
                  {batch.consignmentId || batch.id}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Cassava Variety
              </span>
              <div className="flex items-center space-x-1.5">
                <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-slate-900 truncate" title={batch.variety}>
                  {batch.variety}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Batch Weight / Avg.
              </span>
              <div className="flex items-center space-x-1.5">
                <Weight className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-slate-900">
                  {batch.weight.toLocaleString()} {batch.weightUnit}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Avg: {batch.averageWeight ? `${batch.averageWeight} ${batch.averageWeightUnit}` : "0.85 kg / root"}
              </span>
            </div>
          </div>

          {/* Laboratory Quality Metrics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center">
              <FileCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Laboratory Quality & Biochemical Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Moisture Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center">
                    <Droplet className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Moisture Content
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${moistureStatus.badgeBg} ${moistureStatus.color} ${moistureStatus.badgeBorder}`}>
                    {moistureStatus.status}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {batch.moistureContent}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">%</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(batch.moistureContent * 4, 100)}%` }}
                  />
                </div>
              </div>

              {/* Cyanide Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center">
                    <FlaskConical className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Cyanide Content (HCN)
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${cyanideSafety.badgeBg} ${cyanideSafety.color} ${cyanideSafety.badgeBorder}`}>
                    {cyanideSafety.level}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline space-x-1.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {batch.cyanideContent}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">mg/kg (ppm)</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      batch.cyanideContent <= 10
                        ? "bg-emerald-500"
                        : batch.cyanideContent <= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(batch.cyanideContent * 1.5, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* YucaHub Tracking Lifecycle */}
          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-950 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                YucaHub In-Facility Lifecycle
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                Duration: {hubDuration}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                <span className="text-[10px] font-medium text-slate-400 block">
                  1. Entered YucaHub
                </span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {entryFormatted}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                <span className="text-[10px] font-medium text-slate-400 block">
                  2. Facility Station
                </span>
                <span className="font-semibold text-slate-800 block mt-0.5 flex items-center truncate">
                  <MapPin className="w-3 h-3 text-emerald-600 mr-1 shrink-0" />
                  {batch.hubLocation}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                <span className="text-[10px] font-medium text-slate-400 block">
                  3. Leaves YucaHub
                </span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {exitFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          {(batch.remark || batch.notes) && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center mb-1">
                <FileText className="w-3 h-3 mr-1 text-slate-500" />
                Inspection Remark
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {batch.remark || batch.notes}
              </p>
            </div>
          )}

          {/* Verification Stamp Footer */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-400">
              Verified by YucaChain QR Engine • Certified on {new Date(batch.createdAt).toLocaleDateString()}
            </span>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
