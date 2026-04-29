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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line ? line + " " + word : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
  return currentY;
}

export async function generateClientQuoteJpg(data: ClientQuotePdfData) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 1820;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ── Blue header banner ────────────────────────────────────────────────────
  drawRoundedRect(ctx, 70, 60, 1260, 220, 28, "#002337");

  // Logo inside the banner (left side, vertically centered)
  const logo = await loadLogoImage();
  let logoEndX = 110;
  if (logo) {
    const maxW = 220;
    const maxH = 140;
    const ratio = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
    const w = logo.naturalWidth * ratio;
    const h = logo.naturalHeight * ratio;
    const logoX = 110;
    const logoY = 60 + (220 - h) / 2;
    ctx.drawImage(logo, logoX, logoY, w, h);
    logoEndX = logoX + w + 30;
  }

  // Title text to the right of the logo
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 52px Arial";
  ctx.fillText("Cotizacion de Afiches", logoEndX, 185);
  ctx.font = "400 28px Arial";
  ctx.fillText("Emitido por Mola", logoEndX, 230);
  ctx.textAlign = "right";
  ctx.font = "400 26px Arial";
  ctx.fillText(new Date().toLocaleDateString("es-CO"), 1310, 185);
  ctx.textAlign = "left";

  // ── Summary label ─────────────────────────────────────────────────────────
  ctx.fillStyle = "#ef7d17";
  ctx.font = "700 28px Arial";
  ctx.fillText("Resumen del pedido", 80, 370);

  // ── Details card ──────────────────────────────────────────────────────────
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

  // ── Price without IVA card ────────────────────────────────────────────────
  drawRoundedRect(ctx, 70, 930, 1260, 320, 22, "#ef7d17");
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 28px Arial";
  ctx.fillText("Valores sin IVA", 110, 995);
  ctx.font = "500 34px Arial";
  ctx.fillText("Precio unitario", 110, 1085);
  ctx.textAlign = "right";
  ctx.fillText(formatMoney(data.precioUnitario), 1310, 1085);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 1130);
  ctx.lineTo(1310, 1130);
  ctx.stroke();
  ctx.font = "700 38px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Precio total", 110, 1205);
  ctx.textAlign = "right";
  ctx.font = "700 56px Arial";
  ctx.fillText(formatMoney(data.precioTotal), 1310, 1205);
  ctx.textAlign = "left";

  // ── Price with IVA card ───────────────────────────────────────────────────
  drawRoundedRect(ctx, 70, 1290, 1260, 210, 22, "#f4f7fb");
  ctx.fillStyle = "#002337";
  ctx.font = "700 28px Arial";
  ctx.fillText("Valores con IVA", 110, 1355);
  ctx.font = "500 32px Arial";
  ctx.fillText("Precio unitario con IVA", 110, 1420);
  ctx.textAlign = "right";
  ctx.fillText(formatMoney(data.precioUnitarioConIva), 1310, 1420);
  ctx.textAlign = "left";
  ctx.fillText("Precio total con IVA", 110, 1485);
  ctx.textAlign = "right";
  ctx.font = "700 32px Arial";
  ctx.fillText(formatMoney(data.precioTotalConIva), 1310, 1485);
  ctx.textAlign = "left";

  // ── Legal footer ──────────────────────────────────────────────────────────
  ctx.strokeStyle = "#e2e9ef";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 1600);
  ctx.lineTo(1330, 1600);
  ctx.stroke();

  ctx.fillStyle = "#56707a";
  ctx.font = "500 24px Arial";
  ctx.fillText("Documento generado desde Cotizador Mola.", 80, 1648);

  ctx.fillStyle = "#8aa4b0";
  ctx.font = "400 22px Arial";
  wrapText(
    ctx,
    "Vigencia de 90 días tras emitida la presente. Los precios expuestos no incluyen diseño. Si no requieres factura electrónica, puede hacer el pago sin IVA.",
    80,
    1700,
    1240,
    36,
  );

  const fileDate = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.download = `cotizacion-mola-${fileDate}.jpg`;
  link.click();
}