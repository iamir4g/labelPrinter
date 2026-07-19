import { toCanvas } from "html-to-image";
import type { LabelSettings } from "@/types/template";
import { getPrintPixelSize, resolvePrintSettings } from "@/utils/print";

function cloneCanvas(source: HTMLCanvasElement) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable");
  ctx.drawImage(source, 0, 0);
  return canvas;
}

function applyThermalPostProcess(
  canvas: HTMLCanvasElement,
  label: LabelSettings,
) {
  const settings = resolvePrintSettings(label);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const threshold = settings.threshold;
  const darkBoost = settings.darkness;

  const gray = new Float32Array(canvas.width * canvas.height);

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    const alpha = data[i + 3] / 255;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let value = (0.299 * r + 0.587 * g + 0.114 * b) * alpha + 255 * (1 - alpha);
    value = Math.max(0, Math.min(255, value - darkBoost));
    gray[idx] = value;
  }

  if (settings.dithering) {
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const idx = y * canvas.width + x;
        const oldPixel = gray[idx];
        const newPixel = oldPixel < threshold ? 0 : 255;
        const error = oldPixel - newPixel;
        gray[idx] = newPixel;
        if (x + 1 < canvas.width) gray[idx + 1] += error * (7 / 16);
        if (x - 1 >= 0 && y + 1 < canvas.height)
          gray[idx + canvas.width - 1] += error * (3 / 16);
        if (y + 1 < canvas.height) gray[idx + canvas.width] += error * (5 / 16);
        if (x + 1 < canvas.width && y + 1 < canvas.height)
          gray[idx + canvas.width + 1] += error * (1 / 16);
      }
    }
  } else {
    for (let idx = 0; idx < gray.length; idx += 1) {
      gray[idx] = gray[idx] < threshold ? 0 : 255;
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const value = gray[i / 4] < 127 ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export async function renderLabelToPng(
  node: HTMLElement,
  label: LabelSettings,
) {
  const settings = resolvePrintSettings(label);
  const { widthPx, heightPx } = getPrintPixelSize(settings);

  await document.fonts.ready.catch(() => undefined);

  const canvas = await toCanvas(node, {
    cacheBust: true,
    pixelRatio: 1,
    backgroundColor: "#ffffff",
    canvasWidth: widthPx,
    canvasHeight: heightPx,
    width: node.offsetWidth,
    height: node.offsetHeight,
    style: {
      transform: "none",
      transformOrigin: "top left",
    },
  });

  const output =
    settings.printMode === "thermal"
      ? applyThermalPostProcess(cloneCanvas(canvas), settings)
      : canvas;

  return output.toDataURL("image/png");
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function openEmptyPrintWindow() {
  const w = window.open("", "_blank");
  if (!w) return null;
  w.document.open();
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8" /><title>Preparing…</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial; padding: 16px;">Preparing print…</body></html>`,
  );
  w.document.close();
  return w;
}

export function writePrintDocument(
  w: Window,
  pngDataUrl: string,
  label: LabelSettings,
) {
  const settings = resolvePrintSettings(label);
  const safeTitle = "Label Print";
  const scale = settings.printScalePercent / 100;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      @page { size: ${settings.widthMm}mm ${settings.heightMm}mm; margin: 0; }
      html, body {
        padding: 0;
        margin: 0;
        background: white;
        width: ${settings.widthMm}mm;
        height: ${settings.heightMm}mm;
        overflow: hidden;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body {
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
      }
      .wrap {
        width: ${settings.widthMm}mm;
        height: ${settings.heightMm}mm;
        overflow: hidden;
      }
      img {
        width: calc(${settings.widthMm}mm * ${scale});
        height: calc(${settings.heightMm}mm * ${scale});
        display: block;
        image-rendering: pixelated;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img id="labelImg" src="${pngDataUrl}" alt="label" />
    </div>
    <script>
      const img = document.getElementById('labelImg');
      if (img) {
        img.onload = () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 50);
        };
      }
    </script>
  </body>
</html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
