"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CotizacionBreakdown, formatCop } from "@/lib/cotizador";
import { ClientQuotePdfData, generateClientQuotePdf } from "@/lib/cotizacion-pdf";
import { generateClientQuoteJpg } from "@/lib/cotizacion-jpg";

type SummaryPanelProps = {
  breakdown: CotizacionBreakdown | null;
  loading: boolean;
  validationError: string | null;
  resumen: string;
  pdfData: ClientQuotePdfData | null;
};

function PriceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-brand border border-[#18425b] bg-[#0b3045] px-3 py-2">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export function SummaryPanel({
  breakdown,
  loading,
  validationError,
  resumen,
  pdfData,
}: SummaryPanelProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);

  async function handleGeneratePdf() {
    if (!pdfData) {
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await generateClientQuotePdf(pdfData);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  async function handleGenerateJpg() {
    if (!pdfData) {
      return;
    }

    setIsGeneratingJpg(true);
    try {
      await generateClientQuoteJpg(pdfData);
    } finally {
      setIsGeneratingJpg(false);
    }
  }

  return (
    <aside className="lg:sticky lg:top-6">

      <div className="rounded-[18px] border border-[#11354a] bg-brand-blue p-5 shadow-brand sm:p-6">
        <div className="mb-5 flex items-center justify-center">
          <Image src="/LogoMola.png" alt="Logo Mola" width={140} height={56} className="object-contain" />
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-orange">Paso 2 - Resumen de cotización</p>
          <h3 className="text-lg font-semibold text-white">Resumen listo para compartir</h3>
        </div>

        {validationError ? (
          <div className="rounded-brand border border-[#ffd7b8] bg-[#fff4e8] px-3 py-2 text-sm text-[#8a4f1b]">
            {validationError}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-3 space-y-2">
            <div className="h-9 animate-pulse rounded-brand bg-[#0d3a52]" />
            <div className="h-9 animate-pulse rounded-brand bg-[#0d3a52]" />
            <div className="h-9 animate-pulse rounded-brand bg-[#0d3a52]" />
          </div>
        ) : breakdown ? (
          <motion.div
            key={`${breakdown.precioFinal}-${breakdown.pliegos}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-3"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isGeneratingPdf || !pdfData}
                onClick={() => void handleGeneratePdf()}
                className="rounded-brand bg-white px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-[#fff4eb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingPdf ? "Generando PDF..." : "Descargar PDF cliente"}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isGeneratingJpg || !pdfData}
                onClick={() => void handleGenerateJpg()}
                className="rounded-brand border border-white/30 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingJpg ? "Generando JPG..." : "Descargar JPG cliente"}
              </motion.button>
            </div>

            <div className="rounded-brand border border-[#18425b] bg-[#0b3045] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-orange">Resumen</p>
              <p className="mt-2 text-sm font-semibold text-white">{pdfData?.totalAfichesAPliego ?? "Resumen de afiches"}</p>
              <ul className="mt-3 space-y-1 text-sm leading-6 text-white/90">
                <li>Tipo de papel: {pdfData?.papel ?? "-"}</li>
                <li>Cantidad: {pdfData?.cantidad ?? "-"}</li>
                <li>Medida: {pdfData?.medida ?? "-"}</li>
                <li>Tintas: {pdfData?.tintas ?? "-"}</li>
              </ul>
              <p className="mt-3 text-xs text-white/70">{resumen}</p>
            </div>

            <div className="mt-4 rounded-brand bg-brand-orange px-4 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">Sin IVA</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/80">Precio unitario</span>
                  <span className="text-lg font-semibold">${formatCop(breakdown.precioUnidad)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-2">
                  <span className="text-sm text-white/80">Precio total</span>
                  <span className="text-2xl font-bold">${formatCop(breakdown.precioFinal)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-brand border border-[#18425b] bg-[#0b3045] px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Con IVA</p>
              <div className="mt-3 space-y-2">
                <PriceItem label="Precio unitario con IVA" value={`$${formatCop(breakdown.precioUnidadConIva)}`} />
                <PriceItem label="Precio total con IVA" value={`$${formatCop(breakdown.precioFinalConIva)}`} />
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="mt-3 text-sm text-white/70">Ajusta los parámetros para ver la cotización.</p>
        )}
      </div>
    </aside>
  );
}