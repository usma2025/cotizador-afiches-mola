"use client";

import { jsPDF } from "jspdf";
import { formatCop } from "@/lib/cotizador";

export type ClientQuotePdfData = {
  cantidad: number;
  formato: string;
  tintas: string;
  papel: string;
  resumen: string;
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

function drawLabelValue(
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  pdf.setFillColor(244, 247, 251);
  pdf.roundedRect(x, y, width, height, 5, 5, "F");

  pdf.setTextColor(86, 107, 122);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(label, x + 5, y + 7);

  pdf.setTextColor(0, 35, 55);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(value, x + 5, y + 15);
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
  pdf.text("Resumen", margin, 69);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const resumenLines = pdf.splitTextToSize(data.resumen, contentWidth);
  pdf.text(resumenLines, margin, 76);

  drawLabelValue(pdf, "Cantidad", String(data.cantidad), margin, 92, 40, 20);
  drawLabelValue(pdf, "Formato", data.formato, margin + 45, 92, 60, 20);
  drawLabelValue(pdf, "Tintas", data.tintas, margin + 110, 92, 84, 20);
  drawLabelValue(pdf, "Papel", data.papel, margin, 118, contentWidth, 20);

  pdf.setFillColor(239, 125, 23);
  pdf.roundedRect(margin, 148, contentWidth, 42, 8, 8, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Valores sin IVA", margin + 6, 158);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Precio unitario", margin + 6, 170);
  pdf.setFont("helvetica", "bold");
  pdf.text(formatMoney(data.precioUnitario), pageWidth - margin - 6, 170, { align: "right" });

  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.35);
  pdf.line(margin + 6, 175, pageWidth - margin - 6, 175);

  pdf.setFont("helvetica", "normal");
  pdf.text("Precio total", margin + 6, 184);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(formatMoney(data.precioTotal), pageWidth - margin - 6, 184, { align: "right" });

  pdf.setFillColor(244, 247, 251);
  pdf.roundedRect(margin, 198, contentWidth, 30, 8, 8, "F");
  pdf.setTextColor(0, 35, 55);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Valores con IVA", margin + 6, 208);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Precio unitario con IVA", margin + 6, 217);
  pdf.text(formatMoney(data.precioUnitarioConIva), pageWidth - margin - 6, 217, { align: "right" });
  pdf.text("Precio total con IVA", margin + 6, 224);
  pdf.setFont("helvetica", "bold");
  pdf.text(formatMoney(data.precioTotalConIva), pageWidth - margin - 6, 224, { align: "right" });

  pdf.setDrawColor(226, 233, 239);
  pdf.line(margin, 240, pageWidth - margin, 240);
  pdf.setTextColor(86, 107, 122);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Documento generado desde Cotizador Mola.", margin, 247);

  const fileDate = new Date().toISOString().slice(0, 10);
  pdf.save(`cotizacion-mola-${fileDate}.pdf`);
}