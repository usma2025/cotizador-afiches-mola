"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  API_URL,
  clampCantidad,
  cotizar,
  DEFAULT_SISTEMA,
  fetchSistema,
  Sistema,
  SistemaConfig,
  TINTA_LABELS,
  validateCotizacionInput,
} from "@/lib/cotizador";
import { ClientQuotePdfData } from "@/lib/cotizacion-pdf";
import { QuoteForm } from "./quote-form";
import { SummaryPanel } from "./summary-panel";
import { ConfigModal } from "./config-modal";
import { InternalDetailsPanel } from "./internal-details-panel";

function firstKey(record: Record<string, unknown>) {
  return Object.keys(record)[0] ?? "";
}

export default function CotizadorApp() {
  const [sistema, setSistema] = useState<Sistema>(DEFAULT_SISTEMA);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [cantidad, setCantidad] = useState(100);
  const [papelKey, setPapelKey] = useState("");
  const [formatoKey, setFormatoKey] = useState("");
  const [tintaSeleccionada, setTintaSeleccionada] = useState(1);

  const [configOpen, setConfigOpen] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [configDraft, setConfigDraft] = useState<SistemaConfig>({
    margen_ganancia: DEFAULT_SISTEMA.margen_ganancia,
    costo_arranque: DEFAULT_SISTEMA.costo_arranque,
    costo_corte: DEFAULT_SISTEMA.costo_corte,
    costos_adicionales: DEFAULT_SISTEMA.costos_adicionales,
    sobrante_produccion: DEFAULT_SISTEMA.sobrante_produccion,
  });
  const [selectedPaper, setSelectedPaper] = useState("");
  const [selectedPaperPrice, setSelectedPaperPrice] = useState(0);

  // Keep loading logic encapsulated to allow retries and future polling.
  const loadSistema = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const loaded = await fetchSistema();
      const nextPapel = firstKey(loaded.papeles);
      const nextFormato = firstKey(loaded.formatos);

      setSistema(loaded);
      setPapelKey(nextPapel);
      setFormatoKey(nextFormato);
      setSelectedPaper(nextPapel);
      setSelectedPaperPrice(loaded.papeles[nextPapel]?.precio70x100 ?? 0);
      setConfigDraft({
        margen_ganancia: loaded.margen_ganancia,
        costo_arranque: loaded.costo_arranque,
        costo_corte: loaded.costo_corte,
        costos_adicionales: loaded.costos_adicionales,
        sobrante_produccion: loaded.sobrante_produccion,
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Error de carga inesperado");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSistema();
  }, [loadSistema]);

  const validationError = useMemo(() => {
    return validateCotizacionInput({ cantidad, papelKey, formatoKey, tintaSeleccionada });
  }, [cantidad, papelKey, formatoKey, tintaSeleccionada]);

  const breakdown = useMemo(() => {
    if (validationError || !papelKey || !formatoKey || isLoading) {
      return null;
    }

    try {
      return cotizar(sistema, {
        cantidad,
        papelKey,
        formatoKey,
        tintaSeleccionada,
      });
    } catch {
      return null;
    }
  }, [cantidad, formatoKey, isLoading, papelKey, sistema, tintaSeleccionada, validationError]);

  function handleReset() {
    setCantidad(100);
    setTintaSeleccionada(1);
    setFeedback(null);
  }

  function openConfig() {
    const currentPrice = sistema.papeles[selectedPaper]?.precio70x100 ?? 0;
    setSelectedPaperPrice(currentPrice);
    setConfigOpen(true);
  }

  async function saveConfig() {
    if (!selectedPaper) {
      return;
    }

    setSavingConfig(true);
    setFeedback(null);

    try {
      const urlPapel = `${API_URL}?tipo=papel&papel=${encodeURIComponent(selectedPaper)}&precio70x100=${selectedPaperPrice}`;

      const urlConfig = `${API_URL}?tipo=config&margen_ganancia=${configDraft.margen_ganancia}&costo_arranque=${configDraft.costo_arranque}&costo_corte=${configDraft.costo_corte}&costos_adicionales=${configDraft.costos_adicionales}&sobrante_produccion=${configDraft.sobrante_produccion}`;

      await Promise.all([fetch(urlPapel), fetch(urlConfig)]);

      setConfigOpen(false);
      setFeedback("Configuración guardada correctamente.");
      await loadSistema();
    } catch {
      setFeedback("No se pudo guardar la configuración.");
    } finally {
      setSavingConfig(false);
    }
  }

  const papelOptions = Object.keys(sistema.papeles);
  const formatoOptions = Object.entries(sistema.formatos).map(([key, value]) => ({
    key,
    label: value.label,
  }));

  const resumenCotizacion = useMemo(() => {
    const formatoLabel = sistema.formatos[formatoKey]?.label ?? "medida seleccionada";
    const tintaLabel = TINTA_LABELS[tintaSeleccionada] ?? "tintas seleccionadas";
    const papelLabel = papelKey || "papel seleccionado";

    return `Afiches a ${formatoLabel}, ${tintaLabel}, en papel ${papelLabel}.`;
  }, [formatoKey, papelKey, sistema.formatos, tintaSeleccionada]);

  const pdfData = useMemo<ClientQuotePdfData | null>(() => {
    if (!breakdown) {
      return null;
    }

    const medida = sistema.formatos[formatoKey]?.label ?? "Formato seleccionado";

    return {
      cantidad,
      medida,
      formato: medida,
      tintas: TINTA_LABELS[tintaSeleccionada] ?? "Tintas seleccionadas",
      papel: papelKey || "Papel seleccionado",
      resumen: resumenCotizacion,
      totalAfichesAPliego: `${cantidad} afiches a pliego`,
      precioUnitario: breakdown.precioUnidad,
      precioTotal: breakdown.precioFinal,
      precioUnitarioConIva: breakdown.precioUnidadConIva,
      precioTotalConIva: breakdown.precioFinalConIva,
    };
  }, [breakdown, cantidad, formatoKey, papelKey, resumenCotizacion, sistema.formatos, tintaSeleccionada]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <motion.nav
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
        className="mb-5 rounded-[18px] border border-[#11354a] bg-brand-blue px-4 py-3 shadow-brand sm:px-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <motion.div
            initial={{ opacity: 0.75, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/LogoMola.png"
              alt="Logo Mola"
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-contain"
              priority
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Mola</p>
              <p className="text-sm font-semibold text-white sm:text-base">Cotizador Pro</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="rounded-brand border border-white/30 px-3 py-2 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10"
            >
              Nueva
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openConfig}
              className="rounded-brand bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Configuración
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6 rounded-[18px] border border-[#d9e3ea] bg-white/95 p-5 shadow-surface backdrop-blur sm:p-6"
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Cotización Inteligente</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-blue sm:text-3xl">
              Cotizador de Afiches
            </h1>
            
          </div>

          <div className="rounded-brand border border-[#d9e3ea] bg-[#f8fbfd] px-4 py-3">
            <p className="text-xs font-medium text-[#507084]">Estado</p>
            <p className="text-sm font-semibold text-brand-blue">
              {isLoading ? "Cargando configuración..." : "Listo para cotizar"}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {feedback ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-4 rounded-brand border border-[#ffd7b7] bg-[#fff4eb] px-3 py-2 text-sm text-[#8a4f1b]"
            >
              {feedback}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.header>

      {loadError ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{loadError}</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => void loadSistema()}
            className="mt-3 rounded-brand bg-brand-orange px-3 py-2 font-semibold text-white hover:brightness-105"
          >
            Reintentar
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="space-y-5">
            <QuoteForm
              cantidad={cantidad}
              onCantidadChange={(value) => setCantidad(clampCantidad(value))}
              papelKey={papelKey}
              onPapelChange={setPapelKey}
              formatoKey={formatoKey}
              onFormatoChange={setFormatoKey}
              tintaSeleccionada={tintaSeleccionada}
              onTintaChange={setTintaSeleccionada}
              papelOptions={papelOptions}
              formatoOptions={formatoOptions}
              onReset={handleReset}
            />

            <div className="hidden lg:block">
              <InternalDetailsPanel breakdown={breakdown} loading={isLoading} />
            </div>
          </div>

          <SummaryPanel
            breakdown={breakdown}
            loading={isLoading}
            validationError={validationError}
            resumen={resumenCotizacion}
            pdfData={pdfData}
          />

          <div className="mt-16 lg:hidden">
            <InternalDetailsPanel breakdown={breakdown} loading={isLoading} />
          </div>
        </motion.div>
      )}

      <footer className="mt-8 rounded-[18px] border border-[#11354a] bg-brand-blue px-4 py-4 text-white/85 shadow-brand sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/LogoMola.png"
              alt="Logo Mola"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <p className="text-sm font-medium">Mola · Cotizador de Afiches</p>
          </div>
          <p className="text-xs text-white/65">Sistema de cotización en tiempo real</p>
        </div>
      </footer>

      <ConfigModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        papeles={sistema.papeles}
        config={configDraft}
        onConfigChange={setConfigDraft}
        selectedPaper={selectedPaper}
        onSelectedPaperChange={(paper) => {
          setSelectedPaper(paper);
          setSelectedPaperPrice(sistema.papeles[paper]?.precio70x100 ?? 0);
        }}
        selectedPaperPrice={selectedPaperPrice}
        onSelectedPaperPriceChange={setSelectedPaperPrice}
        onSave={() => void saveConfig()}
        saving={savingConfig}
      />
    </section>
  );
}