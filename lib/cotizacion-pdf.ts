"use client";

import { jsPDF } from "jspdf";
import { formatCop } from "@/lib/cotizador";

export type ClientQuotePdfData = {
  cantidad: number;
  medida: string;
  formato: string;
  tintas: string;
  papel: string;
  resumen: string;
  totalAfichesAPliego: string;
  precioUnitario: number;
  precioTotal: number;
  precioUnitarioConIva: number;
  precioTotalConIva: number;
};

function formatMoney(value: number) {
  return `$${formatCop(value)}`;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageDimensions(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = reject;
    image.src = src;
  });
}

async function loadLogoDataUrl() {
  const response = await fetch("/LogoMola.png");
  if (!response.ok) {
    return null;
  }

  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  const dimensions = await getImageDimensions(dataUrl);

  return {
    dataUrl,
    ...dimensions,
  };
}

export async function generateClientQuotePdf(data: ClientQuotePdfData) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  pdf.setFillColor(0, 35, 55);
  pdf.roundedRect(margin, 14, contentWidth, 34, 8, 8, "F");

  const logo = await loadLogoDataUrl();
  if (logo) {
    const maxWidth = 18;
    const maxHeight = 18;
    const ratio = Math.min(maxWidth / logo.width, maxHeight / logo.height);
    const renderWidth = logo.width * ratio;
    const renderHeight = logo.height * ratio;
    const x = margin + 6 + (maxWidth - renderWidth) / 2;
    const y = 19 + (maxHeight - renderHeight) / 2;

    pdf.addImage(logo.dataUrl, "PNG", x, y, renderWidth, renderHeight);
  }

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Cotizacion de Afiches", margin + 30, 27);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Mola", margin + 30, 34);
  pdf.text(`Fecha: ${new Date().toLocaleDateString("es-CO")}`, pageWidth - margin - 34, 27);

  pdf.setTextColor(239, 125, 23);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Cotizacion comercial para cliente", margin, 59);

  pdf.setTextColor(0, 35, 55);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Resumen del pedido", margin, 69);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const resumenLines = pdf.splitTextToSize(data.resumen, contentWidth);
  pdf.text(resumenLines, margin, 76);

  const orderSectionY = 94;
  pdf.setFillColor(244, 247, 251);
  pdf.roundedRect(margin, orderSectionY, contentWidth, 48, 8, 8, "F");

  pdf.setTextColor(0, 35, 55);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(data.totalAfichesAPliego, margin + 6, orderSectionY + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const orderLines = [
    `Tipo de papel: ${data.papel}`,
    `Cantidad: ${data.cantidad}`,
    `Medida: ${data.medida}`,
    `Tintas: ${data.tintas}`,
  ];
  pdf.text(orderLines, margin + 6, orderSectionY + 18);

  pdf.setFillColor(239, 125, 23);
  pdf.roundedRect(margin, 150, contentWidth, 42, 8, 8, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Valores sin IVA", margin + 6, 160);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Precio unitario", margin + 6, 172);
  pdf.setFont("helvetica", "bold");
  pdf.text(formatMoney(data.precioUnitario), pageWidth - margin - 6, 172, { align: "right" });

  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.35);
  pdf.line(margin + 6, 177, pageWidth - margin - 6, 177);

  pdf.setFont("helvetica", "normal");
  pdf.text("Precio total", margin + 6, 186);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(formatMoney(data.precioTotal), pageWidth - margin - 6, 186, { align: "right" });

  pdf.setFillColor(244, 247, 251);
  pdf.roundedRect(margin, 201, contentWidth, 30, 8, 8, "F");
  pdf.setTextColor(0, 35, 55);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Valores con IVA", margin + 6, 211);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Precio unitario con IVA", margin + 6, 220);
  pdf.text(formatMoney(data.precioUnitarioConIva), pageWidth - margin - 6, 220, { align: "right" });
  pdf.text("Precio total con IVA", margin + 6, 227);
  pdf.setFont("helvetica", "bold");
  pdf.text(formatMoney(data.precioTotalConIva), pageWidth - margin - 6, 227, { align: "right" });

  pdf.setDrawColor(226, 233, 239);
  pdf.line(margin, 242, pageWidth - margin, 242);
  pdf.setTextColor(86, 107, 122);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Documento generado desde Cotizador Mola.", margin, 249);
  pdf.text("Emitido por Mola", pageWidth - margin, 249, { align: "right" });

  const fileDate = new Date().toISOString().slice(0, 10);
  pdf.save(`cotizacion-mola-${fileDate}.pdf`);
}