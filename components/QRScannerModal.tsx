"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Camera,
  Upload,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { CassavaBatch } from "@/types/cassava";
import { decodeBatchFromUrlData } from "@/lib/utils";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchScanned: (batch: CassavaBatch) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onBatchScanned,
}) => {
  const [activeMode, setActiveMode] = useState<"camera" | "upload">("camera");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Process decoded text (handles both verification URLs and direct JSON)
  const processDecodedString = (decodedText: string): boolean => {
    try {
      // Case 1: Verification URL with ?data=
      if (decodedText.includes("data=")) {
        const urlObj = new URL(decodedText);
        const dataParam = urlObj.searchParams.get("data");
        if (dataParam) {
          const batch = decodeBatchFromUrlData(dataParam);
          if (batch && batch.variety) {
            stopCamera();
            onBatchScanned(batch);
            onClose();
            return true;
          }
        }
      }

      // Case 2: Raw JSON string
      if (decodedText.trim().startsWith("{")) {
        const parsed = JSON.parse(decodedText);
        if (parsed && (parsed.variety || parsed.companyName)) {
          stopCamera();
          onBatchScanned(parsed as CassavaBatch);
          onClose();
          return true;
        }
      }

      // Case 3: Base64 string directly
      const batch = decodeBatchFromUrlData(decodedText.trim());
      if (batch && batch.variety) {
        stopCamera();
        onBatchScanned(batch);
        onClose();
        return true;
      }

      setErrorMessage("QR Code detected, but it does not contain valid YucaChain batch data.");
      return false;
    } catch (err) {
      console.error("Error processing decoded string:", err);
      setErrorMessage("Could not parse YucaChain batch data from this QR code.");
      return false;
    }
  };

  // Start Camera using Html5Qrcode
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      setIsScanning(true);

      const { Html5Qrcode } = await import("html5-qrcode");

      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (_) {}
      }

      const qrScanner = new Html5Qrcode("reader-region");
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          processDecodedString(decodedText);
        },
        (error: any) => {
          // Normal frame scanning misses are ignored
        }
      );

      setCameraActive(true);
      setIsScanning(false);
    } catch (err: any) {
      console.error("Camera start error:", err);
      setErrorMessage(
        "Could not access camera. Please check camera permissions, or use 'Upload QR Image' tab."
      );
      setCameraActive(false);
      setIsScanning(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (_) {}
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && activeMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  // Handle File Upload Scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("hidden-file-reader");
      const decodedText = await scanner.scanFile(file, true);
      scanner.clear();

      if (decodedText) {
        processDecodedString(decodedText);
      } else {
        setErrorMessage("No QR code found in the uploaded image. Please try another image.");
      }
    } catch (err) {
      console.error("File scan error:", err);
      setErrorMessage("Could not detect a valid QR code in this image. Please ensure the QR code is clear.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Scan YucaChain QR</h3>
              <p className="text-xs text-slate-500">
                Point camera or upload image to inspect cassava batch
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-slate-100 p-1 mt-4">
          <button
            onClick={() => setActiveMode("camera")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeMode === "camera"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => {
              stopCamera();
              setActiveMode("upload");
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeMode === "upload"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload QR Image</span>
          </button>
        </div>

        {/* Camera View Mode */}
        {activeMode === "camera" && (
          <div className="mt-4 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-emerald-500/40">
              <div id="reader-region" className="w-full h-full" />

              {isScanning && !cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/80 p-4">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                  <p className="text-xs font-medium">Requesting camera access...</p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 text-center mt-3">
              Position the YucaChain QR code inside the target frame to scan automatically.
            </p>
          </div>
        )}

        {/* Image Upload Mode */}
        {activeMode === "upload" && (
          <div className="mt-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50/30 hover:bg-emerald-50/60 transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Click to upload QR code image
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Supports downloaded PNG, JPG, or screenshot files of YucaChain QR code passports
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div id="hidden-file-reader" className="hidden" />
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
