"use client";

import React, { useState, useEffect } from "react";
import {
  Sprout,
  Calendar,
  Weight,
  Droplet,
  FlaskConical,
  Building2,
  MapPin,
  Sparkles,
  QrCode,
  CheckCircle2,
  Hash,
  Scale,
  FileText,
  RefreshCw,
} from "lucide-react";
import { CassavaBatch } from "@/types/cassava";
import {
  generateBatchId,
  generateConsignmentId,
  getCyanideSafety,
  getMoistureStatus,
  calculateHubDuration,
  CASSAVA_VARIETIES,
  YUCA_HUBS,
} from "@/lib/utils";

interface CassavaFormProps {
  onGenerate: (batch: CassavaBatch) => void;
  isGenerating?: boolean;
}

export const CassavaForm: React.FC<CassavaFormProps> = ({ onGenerate, isGenerating }) => {
  // Form State - generate fresh unique consignment ID for each new intake
  const [consignmentId, setConsignmentId] = useState("");
  const [companyName, setCompanyName] = useState("YucaChain");
  const [variety, setVariety] = useState("TME 419");
  const [moistureContent, setMoistureContent] = useState<string>("12.4");
  const [cyanideContent, setCyanideContent] = useState<string>("8.5");
  const [weight, setWeight] = useState<string>("2500");
  const [weightUnit, setWeightUnit] = useState<"kg" | "tonnes" | "bags">("kg");
  const [averageWeight, setAverageWeight] = useState<string>("0.85");
  const [averageWeightUnit, setAverageWeightUnit] = useState<"kg" | "g">("kg");

  // Generate unique consignment ID on mount
  useEffect(() => {
    setConsignmentId(generateConsignmentId());
  }, []);

  // Default dates
  const todayStr = new Date().toISOString().slice(0, 16);
  const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [entryDate, setEntryDate] = useState(todayStr);
  const [exitDate, setExitDate] = useState(fiveDaysLater);
  const hubLocation = YUCA_HUBS[0] || "YucaHub Eyenkorin, Ilorin City, Kwara State";
  const [remark, setRemark] = useState("Clean harvest, optimal root firmness, low cyanide rating. Verified ready for premium milling.");

  // Calculated safety indicators
  const numMoisture = parseFloat(moistureContent) || 0;
  const numCyanide = parseFloat(cyanideContent) || 0;
  const cyanideSafety = getCyanideSafety(numCyanide);
  const moistureStatus = getMoistureStatus(numMoisture);
  const hubDuration = calculateHubDuration(entryDate, exitDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const batchData: CassavaBatch = {
      id: generateBatchId(),
      consignmentId: consignmentId.trim() || generateConsignmentId(),
      companyName: companyName.trim() || "YucaChain",
      variety: variety.trim() || "Standard Cassava",
      moistureContent: parseFloat(moistureContent) || 0,
      cyanideContent: parseFloat(cyanideContent) || 0,
      weight: parseFloat(weight) || 0,
      weightUnit,
      averageWeight: parseFloat(averageWeight) || 0,
      averageWeightUnit,
      entryDate,
      exitDate,
      hubLocation,
      remark: remark.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onGenerate(batchData);
  };

  const loadSampleData = () => {
    setConsignmentId(generateConsignmentId());
    setCompanyName("YucaChain");
    setVariety("Yellow Cassava (TMS 01/1368)");
    setMoistureContent("11.8");
    setCyanideContent("7.2");
    setWeight("3800");
    setWeightUnit("kg");
    setAverageWeight("0.92");
    setAverageWeightUnit("kg");
    setRemark("Biofortified Vitamin A roots. Uniform tubers with minimal peel blemishes, inspected at reception bay.");
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs relative">
      {/* Header bar */}
      <div className="flex flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Batch Intake
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Passport Specification</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight">
            Cassava Intake Details
          </h2>
        </div>

        <button
          type="button"
          onClick={loadSampleData}
          className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
          Load Sample
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Row 1: Company Name & Consignment ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <Building2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              Company Name
            </label>
            <div className="relative">
              <input
                id="company-name-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="YucaChain"
              />
              <span className="absolute right-2.5 top-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                Verified
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <Hash className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Consignment ID
              </label>
              <button
                type="button"
                onClick={() => setConsignmentId(generateConsignmentId())}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer transition-colors"
                title="Generate a new unique consignment ID"
              >
                <RefreshCw className="w-3 h-3 mr-0.5" />
                <span>New ID</span>
              </button>
            </div>
            <input
              id="consignment-id-input"
              type="text"
              value={consignmentId}
              onChange={(e) => setConsignmentId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="e.g. CNS-2026-XXXX"
            />
          </div>
        </div>

        {/* Row 2: Cassava Variety */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            <Sprout className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
            Variety of Cassava
          </label>
          <input
            id="cassava-variety-input"
            type="text"
            list="cassava-variety-suggestions"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="e.g. TME 419, TMS 30572, Yellow Cassava, Oko-Iyawo, or enter any variety..."
          />
          <datalist id="cassava-variety-suggestions">
            {CASSAVA_VARIETIES.filter((v) => v.value !== "Other").map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </datalist>
        </div>

        {/* Row 3: Moisture Content (%) & Cyanide Content (ppm) - Note text removed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <Droplet className="w-3.5 h-3.5 mr-1 text-blue-500" />
                Moisture Content (%)
              </label>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${moistureStatus.badgeBg} ${moistureStatus.color} ${moistureStatus.badgeBorder}`}>
                {moistureStatus.status}
              </span>
            </div>
            <div className="relative">
              <input
                id="moisture-content-input"
                type="text"
                inputMode="decimal"
                value={moistureContent}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setMoistureContent(val);
                }}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="e.g. 12.4"
              />
              <span className="absolute right-3 top-2 text-slate-400 text-xs font-semibold">%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <FlaskConical className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Cyanide Content (ppm)
              </label>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${cyanideSafety.badgeBg} ${cyanideSafety.color} ${cyanideSafety.badgeBorder}`}>
                {cyanideSafety.level}
              </span>
            </div>
            <div className="relative">
              <input
                id="cyanide-content-input"
                type="text"
                inputMode="decimal"
                value={cyanideContent}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setCyanideContent(val);
                }}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="e.g. 8.5"
              />
              <span className="absolute right-3 top-2 text-slate-400 text-xs font-semibold">mg/kg</span>
            </div>
          </div>
        </div>

        {/* Row 4: Total Batch Weight & Average Cassava Root Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Total Batch Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <Weight className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              Batch Weight
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <input
                id="weight-input"
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setWeight(val);
                }}
                required
                className="flex-1 min-w-0 px-3 py-2 bg-slate-50 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="2500"
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as "kg" | "tonnes" | "bags")}
                className="bg-slate-100 px-2.5 py-2 border-l border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none"
              >
                <option value="kg">kg</option>
                <option value="tonnes">tonnes</option>
                <option value="bags">bags</option>
              </select>
            </div>
          </div>

          {/* Average Weight of the Cassava */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <Scale className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              Average Weight of Cassava
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <input
                id="avg-weight-input"
                type="text"
                inputMode="decimal"
                value={averageWeight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*\.?[0-9]*$/.test(val)) setAverageWeight(val);
                }}
                required
                className="flex-1 min-w-0 px-3 py-2 bg-slate-50 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="0.85"
              />
              <select
                value={averageWeightUnit}
                onChange={(e) => setAverageWeightUnit(e.target.value as "kg" | "g")}
                className="bg-slate-100 px-2.5 py-2 border-l border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none"
              >
                <option value="kg">kg / root</option>
                <option value="g">g / root</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 5: YucaHub In-Facility Logistics */}
        <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              YucaHub Facility Tracking
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Duration: {hubDuration}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Day & Time Enters YucaHub
              </label>
              <input
                id="entry-date-input"
                type="datetime-local"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Day & Time Leaves YucaHub
              </label>
              <input
                id="exit-date-input"
                type="datetime-local"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-emerald-600" />
              YucaHub Facility Location
            </label>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{hubLocation}</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 border border-emerald-200/60 ml-2">
                Verified Hub
              </span>
            </div>
          </div>
        </div>

        {/* Row 6: Remark */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
            <FileText className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
            Remark
          </label>
          <textarea
            id="remark-input"
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add quality inspection remarks, root condition, or processing notes..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        {/* Generate QR Button */}
        <div className="pt-2">
          <button
            id="generate-qr-btn"
            type="submit"
            disabled={isGenerating}
            className="w-full yuca-gradient hover:opacity-95 active:scale-[0.99] text-white py-2.5 px-4 rounded-xl font-semibold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate YucaChain QR Code</span>
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Consignment metrics will be encoded into the verifiable QR passport.
          </p>
        </div>
      </form>
    </div>
  );
};
