"use client";

import { motion } from "framer-motion";
import { TINTA_LABELS } from "@/lib/cotizador";

type QuoteFormProps = {
  cantidad: number;
  onCantidadChange: (value: number) => void;
  papelKey: string;
  onPapelChange: (value: string) => void;
  formatoKey: string;
  onFormatoChange: (value: string) => void;
  tintaSeleccionada: number;
  onTintaChange: (value: number) => void;
  papelOptions: string[];
  formatoOptions: Array<{ key: string; label: string }>;
  onReset: () => void;
};

export function QuoteForm({
  cantidad,
  onCantidadChange,
  papelKey,
  onPapelChange,
  formatoKey,
  onFormatoChange,
  tintaSeleccionada,
  onTintaChange,
  papelOptions,
  formatoOptions,
  onReset,
}: QuoteFormProps) {
  return (
    <div className="rounded-[18px] border border-[#d9e3ea] bg-white p-5 shadow-surface sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-orange">Paso 1 - Cotizacion Mola</p>
          <h2 className="text-lg font-semibold text-brand-blue sm:text-xl">Arma una cotización clara y lista para compartir</h2>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="rounded-brand border border-[#cbd8e1] px-3 py-2 text-sm font-medium text-brand-blue transition hover:border-brand-orange hover:bg-[#fff5ec]"
        >
          Limpiar
        </motion.button>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#334e61]">Cantidad</span>
          <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
            <input
              type="range"
              min={100}
              max={1000}
              step={10}
              value={cantidad}
              onChange={(event) => onCantidadChange(Number(event.target.value))}
              className="h-10 w-full accent-brand-orange"
            />
            <input
              type="number"
              min={100}
              max={1000}
              value={cantidad}
              onChange={(event) => onCantidadChange(Number(event.target.value))}
              className="h-10 rounded-brand border border-[#c9d7e1] bg-[#fbfdff] px-3 text-sm text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
            />
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#334e61]">Papel</span>
            <select
              value={papelKey}
              onChange={(event) => onPapelChange(event.target.value)}
              className="h-11 w-full rounded-brand border border-[#c9d7e1] bg-[#fbfdff] px-3 text-sm text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
            >
              {papelOptions.map((paper) => (
                <option key={paper} value={paper}>
                  {paper}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#334e61]">Formato</span>
            <select
              value={formatoKey}
              onChange={(event) => onFormatoChange(event.target.value)}
              className="h-11 w-full rounded-brand border border-[#c9d7e1] bg-[#fbfdff] px-3 text-sm text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
            >
              {formatoOptions.map((format) => (
                <option key={format.key} value={format.key}>
                  {format.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-[#334e61]">Tintas</span>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 4].map((value) => {
              const selected = tintaSeleccionada === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onTintaChange(value)}
                  className={[
                    "min-h-14 rounded-brand border px-2 py-2 text-center text-xs font-semibold leading-snug transition sm:text-sm",
                    selected
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-[#c9d7e1] bg-white text-brand-blue hover:border-brand-orange hover:bg-[#fff7ef]",
                  ].join(" ")}
                >
                  {TINTA_LABELS[value]}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}