"use client";

import { motion } from "framer-motion";
import { CotizacionBreakdown, formatCop } from "@/lib/cotizador";

type SummaryPanelProps = {
  breakdown: CotizacionBreakdown | null;
  loading: boolean;
  validationError: string | null;
};

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-brand border border-[#18425b] bg-[#0b3045] px-3 py-2">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export function SummaryPanel({ breakdown, loading, validationError }: SummaryPanelProps) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="rounded-[18px] border border-[#11354a] bg-brand-blue p-5 shadow-brand sm:p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-orange">Paso 2</p>
          <h3 className="text-lg font-semibold text-white">Resumen en tiempo real</h3>
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
            className="mt-3 space-y-2"
          >
            <Item label="Producción" value={formatCop(breakdown.totalProduccionUnidades)} />
            <Item label="Pliegos" value={formatCop(breakdown.pliegos)} />
            <Item label="Papel" value={`$${formatCop(breakdown.costoPapel)}`} />
            <Item label="Planchas" value={`$${formatCop(breakdown.costoPlanchas)}`} />
            <Item label="Tintas" value={`$${formatCop(breakdown.costoTintas)}`} />
            <Item label="Costo producción" value={`$${formatCop(breakdown.costoProduccion)}`} />

            <div className="mt-4 rounded-brand bg-brand-orange px-4 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">Precio total</p>
              <p className="mt-1 text-2xl font-bold">${formatCop(breakdown.precioFinal)}</p>
              <p className="text-sm text-white/85">${formatCop(breakdown.precioUnidad)} por unidad</p>
            </div>
          </motion.div>
        ) : (
          <p className="mt-3 text-sm text-white/70">Ajusta los parámetros para ver la cotización.</p>
        )}
      </div>
    </aside>
  );
}