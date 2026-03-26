export const API_URL =
  "https://script.google.com/macros/s/AKfycbxFKGjD5nIWkqm-vktKowg5x1eEQ7Jq_-C6DL-Eu8-57_53RBdHSStPMvA2426mGKMq/exec";

export type Papel = {
  precio70x100: number;
};

export type Formato = {
  division: number;
  tinta: number;
  plancha: number;
  label: string;
};

export type SistemaConfig = {
  margen_ganancia: number;
  costo_arranque: number;
  costo_corte: number;
  costos_adicionales: number;
  sobrante_produccion: number;
};

export type Sistema = {
  papeles: Record<string, Papel>;
  formatos: Record<string, Formato>;
} & SistemaConfig;

export type CotizacionInput = {
  cantidad: number;
  papelKey: string;
  formatoKey: string;
  tintaSeleccionada: number;
};

export type CotizacionBreakdown = {
  totalProduccionUnidades: number;
  pliegos: number;
  costoPapel: number;
  costoPlanchas: number;
  costoTintas: number;
  costoImpresion: number;
  costoProduccion: number;
  precioFinal: number;
  precioUnidad: number;
};

export const TINTA_OPTIONS = [1, 2, 4] as const;

export const DEFAULT_SISTEMA: Sistema = {
  papeles: {},
  formatos: {},
  margen_ganancia: 0.4,
  costo_arranque: 20000,
  costo_corte: 15000,
  costos_adicionales: 10000,
  sobrante_produccion: 20,
};

type ApiResponse = {
  papeles: Array<{ papel: string; precio70x100: string | number }>;
  general: Array<{ clave: keyof SistemaConfig; valor: string | number }>;
  formatos: Array<{
    formato: string;
    division: string | number;
    tinta: string | number;
    plancha: string | number;
    label: string;
  }>;
};

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function fetchSistema(): Promise<Sistema> {
  const response = await fetch(API_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudo cargar la configuración del cotizador");
  }

  const data = (await response.json()) as ApiResponse;

  const papeles = data.papeles.reduce<Record<string, Papel>>((acc, paper) => {
    acc[paper.papel] = {
      precio70x100: parseNumber(paper.precio70x100),
    };
    return acc;
  }, {});

  const formatos = data.formatos.reduce<Record<string, Formato>>((acc, format) => {
    acc[format.formato] = {
      division: parseNumber(format.division, 1),
      tinta: parseNumber(format.tinta),
      plancha: parseNumber(format.plancha),
      label: format.label,
    };
    return acc;
  }, {});

  const parsedGeneral = data.general.reduce<Partial<SistemaConfig>>((acc, entry) => {
    acc[entry.clave] = parseNumber(entry.valor);
    return acc;
  }, {});

  return {
    ...DEFAULT_SISTEMA,
    ...parsedGeneral,
    papeles,
    formatos,
  };
}

export function formatCop(value: number) {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function validateCotizacionInput(input: CotizacionInput) {
  if (!input.tintaSeleccionada) {
    return "Selecciona una opción de tintas";
  }

  if (input.cantidad < 100 || input.cantidad > 1000) {
    return "La cantidad mínima es 100 y la máxima es 1000";
  }

  return null;
}

export function cotizar(sistema: Sistema, input: CotizacionInput): CotizacionBreakdown {
  const formato = sistema.formatos[input.formatoKey];
  const papel = sistema.papeles[input.papelKey];

  if (!formato) {
    throw new Error("Formato inválido");
  }

  if (!papel) {
    throw new Error("Papel inválido");
  }

  const totalProduccionUnidades = input.cantidad + sistema.sobrante_produccion;
  const pliegos = Math.ceil(totalProduccionUnidades / formato.division);

  const costoPapel = pliegos * papel.precio70x100;
  const costoPlanchas = input.tintaSeleccionada * formato.plancha;
  const costoTintas = input.tintaSeleccionada * formato.tinta;
  const costoImpresion = costoPlanchas + costoTintas;

  const costoProduccion =
    sistema.costo_arranque +
    costoPapel +
    costoImpresion +
    sistema.costo_corte +
    sistema.costos_adicionales;

  const precioFinal = costoProduccion * (1 + sistema.margen_ganancia);
  const precioUnidad = precioFinal / input.cantidad;

  return {
    totalProduccionUnidades,
    pliegos,
    costoPapel,
    costoPlanchas,
    costoTintas,
    costoImpresion,
    costoProduccion,
    precioFinal,
    precioUnidad,
  };
}

export function clampCantidad(value: number) {
  if (!Number.isFinite(value)) {
    return 100;
  }
  return Math.min(1000, Math.max(100, Math.round(value)));
}