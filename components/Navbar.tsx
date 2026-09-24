"use client";

import React from "react";
import { QrCode, ScanLine, Sprout, ShieldCheck, History } from "lucide-react";

interface NavbarProps {
  activeTab: "register" | "scanner" | "history";
  setActiveTab: (tab: "register" | "scanner" | "history") => void;
  onOpenScanner: () => void;
  batchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  batchCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab("register")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Yucachain_Logo.png"
              alt="YucaChain Logo"
              className="h-11 sm:h-16 w-auto object-contain"
            />
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 mr-0.5" />
              Hub Verified
            </span>
          </div>

          {/* Navigation Tab Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              id="nav-register-btn"
              onClick={() => setActiveTab("register")}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "register"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5" />
              <span>New Batch</span>
            </button>

            <button
              id="nav-scanner-btn"
              onClick={onOpenScanner}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/50 transition-all shadow-xs cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Scan QR</span>
            </button>

            <button
              id="nav-history-btn"
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "history"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
            >
              <History className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Batches</span>
              {batchCount > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${activeTab === "history"
                    ? "bg-white text-emerald-800"
                    : "bg-emerald-100 text-emerald-800"
                    }`}
                >
                  {batchCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
