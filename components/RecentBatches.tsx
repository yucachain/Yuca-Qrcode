"use client";

import React from "react";
import {
  History,
  QrCode,
  Eye,
  Trash2,
  Calendar,
  Weight,
  Droplet,
  FlaskConical,
  ExternalLink,
} from "lucide-react";
import { CassavaBatch } from "@/types/cassava";
import { getCyanideSafety, getMoistureStatus } from "@/lib/utils";

interface RecentBatchesProps {
  batches: CassavaBatch[];
  onSelectBatch: (batch: CassavaBatch) => void;
  onDeleteBatch: (batchId: string) => void;
}

export const RecentBatches: React.FC<RecentBatchesProps> = ({
  batches,
  onSelectBatch,
  onDeleteBatch,
}) => {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Batches Recorded Yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          When you enter cassava details and generate a QR code, it will automatically be saved here for instant re-access.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Saved Cassava Batches</h2>
          <p className="text-xs text-slate-500">
            {batches.length} batch record{batches.length > 1 ? "s" : ""} saved in this session
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-slate-100">
        {batches.map((batch) => {
          const cyanide = getCyanideSafety(batch.cyanideContent);
          const moisture = getMoistureStatus(batch.moistureContent);

          return (
            <div
              key={batch.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-2xl transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {batch.consignmentId || batch.id}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ({batch.id})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{batch.variety}</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center">
                    <Weight className="w-3 h-3 mr-1 text-slate-400" />
                    {batch.weight.toLocaleString()} {batch.weightUnit}
                  </span>
                  {batch.averageWeight && (
                    <>
                      <span>•</span>
                      <span>Avg: {batch.averageWeight} {batch.averageWeightUnit}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className={`inline-flex items-center font-semibold ${moisture.color}`}>
                    <Droplet className="w-3.5 h-3.5 mr-1" />
                    {batch.moistureContent}% Moisture
                  </span>
                  <span>•</span>
                  <span className={`inline-flex items-center font-semibold ${cyanide.color}`}>
                    <FlaskConical className="w-3.5 h-3.5 mr-1" />
                    {batch.cyanideContent} mg/kg HCN
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => onSelectBatch(batch)}
                  className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View Passport
                </button>
                <button
                  onClick={() => onDeleteBatch(batch.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
