"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Download,
  Share2,
  Copy,
  Printer,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { CassavaBatch } from "@/types/cassava";
import { encodeBatchToUrlData } from "@/lib/utils";

interface QRCodeCardProps {
  batch: CassavaBatch;
  onScanAnother?: () => void;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ batch }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [qrMode, setQrMode] = useState<"url" | "json">("url");
  const [isDownloading, setIsDownloading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState("");

  // Compute the full verification URL
  useEffect(() => {
    const encoded = encodeBatchToUrlData(batch);
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "https://yucachain.io");
    const id = batch.consignmentId || batch.id;
    // URL includes both id for live database lookup and data for instant offline/direct decoding
    const fullUrl = `${origin}/verify?id=${encodeURIComponent(id)}&data=${encoded}`;
    setVerificationUrl(fullUrl);
  }, [batch]);

  // Generate QR Code on canvas
  useEffect(() => {
    if (!qrCanvasRef.current || !verificationUrl) return;

    const payload = qrMode === "url" ? verificationUrl : JSON.stringify(batch, null, 2);

    QRCode.toCanvas(
      qrCanvasRef.current,
      payload,
      {
        width: 260,
        margin: 1.5,
        color: {
          dark: "#064E3B", // YucaChain Forest Emerald
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      },
      (error) => {
        if (error) console.error("QR Code generation error:", error);
      }
    );
  }, [verificationUrl, qrMode, batch]);

  // Download QR Code as Image with YucaChain Logo at the top
  const downloadQRCodeWithLogo = async () => {
    if (!qrCanvasRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      const width = 600;
      const height = 750;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Clean White Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Subtle Outer Border
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 3;
      ctx.strokeRect(3, 3, width - 6, height - 6);

      // 2. Load and Draw YucaChain Logo at the Top
      const logoImg = new Image();
      logoImg.src = "/Yucachain_Logo.png";
      await new Promise((resolve) => {
        logoImg.onload = () => resolve(null);
        logoImg.onerror = () => resolve(null);
      });

      // Draw Logo centered
      const logoW = 220;
      const logoH = 110;
      const logoX = (width - logoW) / 2;
      const logoY = 30;
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

      // 3. Consignment ID / Subtitle
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 20px monospace, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${batch.consignmentId || batch.id}`, width / 2, 165);

      ctx.fillStyle = "#64748B";
      ctx.font = "14px sans-serif";
      ctx.fillText("Official Cassava Traceability Passport", width / 2, 192);

      // Divider line
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 215);
      ctx.lineTo(width - 70, 215);
      ctx.stroke();

      // 4. Draw QR Code in Center
      const qrImage = new Image();
      qrImage.src = qrCanvasRef.current.toDataURL("image/png");
      await new Promise((resolve) => {
        qrImage.onload = () => resolve(null);
        qrImage.onerror = () => resolve(null);
      });

      const qrSize = 380;
      const qrX = (width - qrSize) / 2;
      const qrY = 235;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // 5. Scan Footer Text
      ctx.fillStyle = "#064E3B";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Scan with Camera to Verify Authenticity", width / 2, 655);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "12px sans-serif";
      ctx.fillText("YucaChain Traceability Engine • YucaHub Facility", width / 2, 680);

      // Download trigger
      const link = document.createElement("a");
      link.download = `YucaChain-QR-${batch.consignmentId || batch.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate QR image with logo:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Share QR via Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `YucaChain QR Passport - ${batch.consignmentId || batch.id}`,
          text: `YucaChain Cassava Traceability Passport for ${batch.variety} (${batch.consignmentId || batch.id}).`,
          url: verificationUrl,
        });
      } catch (err) {
        console.log("Share skipped or unsupported", err);
      }
    } else {
      copyVerificationLink();
    }
  };

  // Copy Verification Link
  const copyVerificationLink = async () => {
    if (!verificationUrl) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // Copy QR Image directly to clipboard
  const copyQRImage = async () => {
    if (!qrCanvasRef.current) return;
    try {
      qrCanvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      });
    } catch (err) {
      console.error("Failed to copy image:", err);
      copyVerificationLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* Main QR Display Card */}
      <div
        id="printable-passport"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs overflow-hidden relative"
      >
        {/* Top of QR Code: YucaChain Logo & Consignment ID */}
        <div className="flex flex-col items-center justify-center pb-3 border-b border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Yucachain_Logo.png"
            alt="YucaChain Logo"
            className="h-10 sm:h-12 w-auto object-contain mb-1.5"
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {batch.consignmentId || batch.id}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Passport
            </span>
          </div>
        </div>

        {/* QR Code Canvas Area */}
        <div className="py-5 flex flex-col items-center justify-center">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col items-center">
            <canvas
              ref={qrCanvasRef}
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg bg-white shadow-xs"
            />
            <div className="mt-2.5 flex items-center space-x-1.5 text-xs font-medium text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scan to verify batch authenticity</span>
            </div>
          </div>

          {/* Quick verification link */}
          <div className="mt-3 text-center no-print">
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Test open verification page
            </a>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 no-print">
          {/* Download QR Image with Logo at top */}
          <button
            id="download-passport-btn"
            onClick={downloadQRCodeWithLogo}
            disabled={isDownloading}
            className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
            title="Download QR code image with YucaChain logo on top"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "Generating..." : "Download QR"}</span>
          </button>

          {/* Share QR */}
          <button
            id="share-qr-btn"
            onClick={handleShare}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
            title="Share via native device sharing or link"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share</span>
          </button>

          {/* Copy Link */}
          <button
            id="copy-link-btn"
            onClick={copyVerificationLink}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
            title="Copy verification link to clipboard"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary controls row */}
        <div className="mt-2.5 flex items-center justify-between no-print text-[11px] text-slate-500">
          <button
            onClick={copyQRImage}
            className="hover:text-emerald-700 font-medium inline-flex items-center cursor-pointer"
          >
            {copiedImage ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-600" />
                <span className="text-emerald-600">Copied image to clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                <span>Copy QR to clipboard</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="hover:text-emerald-700 font-medium inline-flex items-center cursor-pointer"
          >
            <Printer className="w-3 h-3 mr-1" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
