"use client";

import { CotizacionBreakdown, formatCop } from "@/lib/cotizador";

type InternalDetailsPanelProps = {
  breakdown: CotizacionBreakdown | null;
  loading: boolean;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-brand border border-[#d9e3ea] bg-[#f8fbfd] px-4 py-3">
      <span className="text-sm text-[#4d687b]">{label}</span>
      <span className="text-sm font-semibold text-brand-blue">{value}</span>
    </div>
  );
}

export function InternalDetailsPanel({ breakdown, loading }: InternalDetailsPanelProps) {
  return (
    <div className="rounded-[18px] border border-[#d9e3ea] bg-white p-5 shadow-surface sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">Detalle interno</p>
        <h3 className="text-lg font-semibold text-brand-blue">Costos y producción</h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-11 animate-pulse rounded-brand bg-[#eef3f7]" />
          <div className="h-11 animate-pulse rounded-brand bg-[#eef3f7]" />
          <div className="h-11 animate-pulse rounded-brand bg-[#eef3f7]" />
        </div>
      ) : breakdown ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Producción" value={formatCop(breakdown.totalProduccionUnidades)} />
          <DetailItem label="Pliegos" value={formatCop(breakdown.pliegos)} />
          <DetailItem label="Papel" value={`$${formatCop(breakdown.costoPapel)}`} />
          <DetailItem label="Planchas" value={`$${formatCop(breakdown.costoPlanchas)}`} />
          <DetailItem label="Tintas" value={`$${formatCop(breakdown.costoTintas)}`} />
          <DetailItem label="Costo producción" value={`$${formatCop(breakdown.costoProduccion)}`} />
        </div>
      ) : (
        <p className="text-sm text-[#5a7385]">Completa la cotización para ver el detalle interno.</p>
      )}
    </div>
  );
}