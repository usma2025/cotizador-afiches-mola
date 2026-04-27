"use client";

import { ClientQuotePdfData } from "@/lib/cotizacion-pdf";
import { formatCop } from "@/lib/cotizador";

function formatMoney(value: number) {
  return `$${formatCop(value)}`;
}

async function loadLogoImage() {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "/LogoMola.png";
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

export async function generateClientQuoteJpg(data: ClientQuotePdfData) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 1800;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRoundedRect(ctx, 70, 70, 1260, 220, 28, "#002337");

  const logo = await loadLogoImage();
  if (logo) {
    const maxSize = 120;
    const ratio = Math.min(maxSize / logo.naturalWidth, maxSize / logo.naturalHeight);
    const width = logo.naturalWidth * ratio;
    const height = logo.naturalHeight * ratio;
    ctx.drawImage(logo, 110 + (maxSize - width) / 2, 120 + (maxSize - height) / 2, width, height);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 58px Arial";
  ctx.fillText("Cotizacion de Afiches", 260, 165);
  ctx.font = "400 30px Arial";
  ctx.fillText("Emitido por Mola", 260, 215);
  ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleDateString("es-CO"), 1270, 165);
  ctx.textAlign = "left";

  ctx.fillStyle = "#ef7d17";
  ctx.font = "700 28px Arial";
  ctx.fillText("Resumen del pedido", 80, 360);

  drawRoundedRect(ctx, 70, 390, 1260, 500, 22, "#f4f7fb");
  ctx.fillStyle = "#002337";
  ctx.font = "700 44px Arial";
  ctx.fillText(data.totalAfichesAPliego, 110, 470);

  const rows = [
    `Tipo de papel: ${data.papel}`,
    `Cantidad: ${data.cantidad}`,
    `Medida: ${data.medida}`,
    `Tintas: ${data.tintas}`,
  ];

  ctx.fillStyle = "#28485e";
  ctx.font = "500 36px Arial";
  rows.forEach((row, index) => {
    ctx.fillText(row, 110, 560 + index * 78);
  });

  drawRoundedRect(ctx, 70, 930, 1260, 320, 22, "#ef7d17");
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 28px Arial";
  ctx.fillText("Valores sin IVA", 110, 995);
  ctx.font = "500 34px Arial";
  ctx.fillText("Precio unitario", 110, 1085);
  ctx.textAlign = "right";
  ctx.fillText(formatMoney(data.precioUnitario), 1270, 1085);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 1130);
  ctx.lineTo(1270, 1130);
  ctx.stroke();
  ctx.font = "700 38px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Precio total", 110, 1205);
  ctx.textAlign = "right";
  ctx.font = "700 56px Arial";
  ctx.fillText(formatMoney(data.precioTotal), 1270, 1205);
  ctx.textAlign = "left";

  drawRoundedRect(ctx, 70, 1290, 1260, 210, 22, "#f4f7fb");
  ctx.fillStyle = "#002337";
  ctx.font = "700 28px Arial";
  ctx.fillText("Valores con IVA", 110, 1355);
  ctx.font = "500 32px Arial";
  ctx.fillText("Precio unitario con IVA", 110, 1420);
  ctx.textAlign = "right";
  ctx.fillText(formatMoney(data.precioUnitarioConIva), 1270, 1420);
  ctx.textAlign = "left";
  ctx.fillText("Precio total con IVA", 110, 1485);
  ctx.textAlign = "right";
  ctx.font = "700 32px Arial";
  ctx.fillText(formatMoney(data.precioTotalConIva), 1270, 1485);
  ctx.textAlign = "left";

  ctx.strokeStyle = "#e2e9ef";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 1620);
  ctx.lineTo(1330, 1620);
  ctx.stroke();
  ctx.fillStyle = "#56707a";
  ctx.font = "500 26px Arial";
  ctx.fillText("Documento generado desde Cotizador Mola", 80, 1675);
  ctx.textAlign = "right";
  ctx.fillText("Emitido por Mola", 1320, 1675);

  const fileDate = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.download = `cotizacion-mola-${fileDate}.jpg`;
  link.click();
}