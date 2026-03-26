"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Papel, SistemaConfig } from "@/lib/cotizador";

type ConfigDraft = SistemaConfig;

type ConfigModalProps = {
  open: boolean;
  onClose: () => void;
  papeles: Record<string, Papel>;
  config: ConfigDraft;
  onConfigChange: (value: ConfigDraft) => void;
  selectedPaper: string;
  onSelectedPaperChange: (value: string) => void;
  selectedPaperPrice: number;
  onSelectedPaperPriceChange: (value: number) => void;
  onSave: () => void;
  saving: boolean;
};

export function ConfigModal({
  open,
  onClose,
  papeles,
  config,
  onConfigChange,
  selectedPaper,
  onSelectedPaperChange,
  selectedPaperPrice,
  onSelectedPaperPriceChange,
  onSave,
  saving,
}: ConfigModalProps) {
  const paperOptions = Object.keys(papeles);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#00131f]/60 p-4"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-[18px] border border-[#d8e2e9] bg-white p-5 shadow-[0_20px_50px_rgba(0,35,55,0.3)] sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-brand-blue">Configuración operativa</h3>
                <p className="text-sm text-[#4e6778]">Ajusta margen, costos y precio por papel.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-brand border border-[#cad8e2] px-3 py-2 text-sm font-medium text-brand-blue transition hover:border-brand-orange hover:bg-[#fff6ee]"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-[#365062]">
                Margen (decimal)
                <input
                  type="number"
                  step="0.01"
                  value={config.margen_ganancia}
                  onChange={(event) =>
                    onConfigChange({ ...config, margen_ganancia: Number(event.target.value) })
                  }
                  className="mt-1 h-10 w-full rounded-brand border border-[#cad8e2] bg-[#fbfdff] px-3 text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                />
              </label>

              <label className="text-sm text-[#365062]">
                Logística
                <input
                  type="number"
                  value={config.costo_arranque}
                  onChange={(event) =>
                    onConfigChange({ ...config, costo_arranque: Number(event.target.value) })
                  }
                  className="mt-1 h-10 w-full rounded-brand border border-[#cad8e2] bg-[#fbfdff] px-3 text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                />
              </label>

              <label className="text-sm text-[#365062]">
                Corte
                <input
                  type="number"
                  value={config.costo_corte}
                  onChange={(event) =>
                    onConfigChange({ ...config, costo_corte: Number(event.target.value) })
                  }
                  className="mt-1 h-10 w-full rounded-brand border border-[#cad8e2] bg-[#fbfdff] px-3 text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                />
              </label>

              <label className="text-sm text-[#365062]">
                Adicionales
                <input
                  type="number"
                  value={config.costos_adicionales}
                  onChange={(event) =>
                    onConfigChange({ ...config, costos_adicionales: Number(event.target.value) })
                  }
                  className="mt-1 h-10 w-full rounded-brand border border-[#cad8e2] bg-[#fbfdff] px-3 text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                />
              </label>

              <label className="text-sm text-[#365062] sm:col-span-2">
                Sobrante de producción
                <input
                  type="number"
                  value={config.sobrante_produccion}
                  onChange={(event) =>
                    onConfigChange({ ...config, sobrante_produccion: Number(event.target.value) })
                  }
                  className="mt-1 h-10 w-full rounded-brand border border-[#cad8e2] bg-[#fbfdff] px-3 text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                />
              </label>
            </div>

            <div className="mt-5 rounded-[14px] border border-[#d8e3ea] bg-[#f9fbfd] p-4">
              <p className="mb-3 text-sm font-semibold text-brand-blue">Precio de papel (70x100)</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                <select
                  value={selectedPaper}
                  onChange={(event) => onSelectedPaperChange(event.target.value)}
                  className="h-10 rounded-brand border border-[#cad8e2] bg-white px-3 text-sm text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                >
                  {paperOptions.map((paper) => (
                    <option key={paper} value={paper}>
                      {paper}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={selectedPaperPrice}
                  onChange={(event) => onSelectedPaperPriceChange(Number(event.target.value))}
                  className="h-10 rounded-brand border border-[#cad8e2] bg-white px-3 text-sm text-brand-blue outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-[#ffd8ba]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={onSave}
                className="rounded-brand bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}