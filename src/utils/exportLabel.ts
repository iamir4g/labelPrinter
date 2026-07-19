import { getFontEmbedCSS, toCanvas } from "html-to-image";
import type { LabelSettings } from "@/types/template";
import { getPrintPixelSize, resolvePrintSettings } from "@/utils/print";

let cachedFontEmbedCSS: string | null = null;
let fontEmbedPromise: Promise<string> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        window.clearTimeout(timer);
        resolve(fallback);
      });
  });
}

async function waitForFonts() {
  await withTimeout(document.fonts.ready.then(() => undefined), 400, undefined);
}

/** پیش‌بارگذاری فونت‌ها تا چاپ اول هم سریع باشد */
export function prefetchFontEmbedCSS(node: HTMLElement) {
  if (cachedFontEmbedCSS || fontEmbedPromise) return fontEmbedPromise;
  fontEmbedPromise = (async () => {
    await waitForFonts();
    try {
      const css = await getFontEmbedCSS(node, {
        cacheBust: false,
        preferredFontFormat: "woff2",
      });
      cachedFontEmbedCSS = css;
      return css;
    } catch {
      cachedFontEmbedCSS = "";
      return "";
    }
  })();
  return fontEmbedPromise;
}

async function getCachedFontEmbedCSS(node: HTMLElement) {
  if (cachedFontEmbedCSS != null) return cachedFontEmbedCSS;
  await prefetchFontEmbedCSS(node);
  return cachedFontEmbedCSS ?? "";
}

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
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const threshold = settings.threshold;
  const darkBoost = settings.darkness;
  const width = canvas.width;
  const height = canvas.height;
  const gray = new Float32Array(width * height);

  for (let i = 0, idx = 0; i < data.length; i += 4, idx += 1) {
    const alpha = data[i + 3] / 255;
    const value =
      (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * alpha +
      255 * (1 - alpha);
    gray[idx] = Math.max(0, Math.min(255, value - darkBoost));
  }

  if (settings.dithering) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        const oldPixel = gray[idx];
        const newPixel = oldPixel < threshold ? 0 : 255;
        const error = oldPixel - newPixel;
        gray[idx] = newPixel;
        if (x + 1 < width) gray[idx + 1] += error * (7 / 16);
        if (x - 1 >= 0 && y + 1 < height)
          gray[idx + width - 1] += error * (3 / 16);
        if (y + 1 < height) gray[idx + width] += error * (5 / 16);
        if (x + 1 < width && y + 1 < height)
          gray[idx + width + 1] += error * (1 / 16);
      }
    }
  } else {
    for (let idx = 0; idx < gray.length; idx += 1) {
      gray[idx] = gray[idx] < threshold ? 0 : 255;
    }
  }

  for (let i = 0, idx = 0; i < data.length; i += 4, idx += 1) {
    const value = gray[idx] < 127 ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

async function renderLabelCanvas(node: HTMLElement, label: LabelSettings) {
  const settings = resolvePrintSettings(label);
  const { widthPx, heightPx } = getPrintPixelSize(settings);

  const [fontEmbedCSS] = await Promise.all([
    getCachedFontEmbedCSS(node),
    waitForFonts(),
  ]);

  // فرصت بده پنجره Preparing یک فریم رندر شود
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => resolve()),
  );

  const canvas = await toCanvas(node, {
    cacheBust: false,
    pixelRatio: 1,
    backgroundColor: "#ffffff",
    canvasWidth: widthPx,
    canvasHeight: heightPx,
    width: node.offsetWidth,
    height: node.offsetHeight,
    preferredFontFormat: "woff2",
    ...(fontEmbedCSS
      ? { skipFonts: true as const, fontEmbedCSS }
      : {}),
    style: {
      transform: "none",
      transformOrigin: "top left",
    },
  });

  return settings.printMode === "thermal"
    ? applyThermalPostProcess(cloneCanvas(canvas), settings)
    : canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("PNG export failed"));
        else resolve(blob);
      },
      "image/png",
    );
  });
}

export async function renderLabelToPng(
  node: HTMLElement,
  label: LabelSettings,
) {
  const canvas = await renderLabelCanvas(node, label);
  return canvas.toDataURL("image/png");
}

export async function renderLabelToBlobUrl(
  node: HTMLElement,
  label: LabelSettings,
) {
  const canvas = await renderLabelCanvas(node, label);
  const blob = await canvasToBlob(canvas);
  return URL.createObjectURL(blob);
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadPngBlob(filename: string, node: HTMLElement, label: LabelSettings) {
  const canvas = await renderLabelCanvas(node, label);
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  downloadDataUrl(filename, url);
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function openEmptyPrintWindow() {
  const w = window.open("", "_blank");
  if (!w) return null;
  w.document.open();
  w.document.write(`<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>آماده‌سازی چاپ…</title>
    <style>
      html, body {
        margin: 0;
        height: 100%;
        font-family: Vazirmatn, Tahoma, Arial, sans-serif;
        background: #0a0a0a;
        color: #e4e4e7;
      }
      body {
        display: grid;
        place-items: center;
      }
      .box {
        text-align: center;
        padding: 24px;
      }
      .spinner {
        width: 28px;
        height: 28px;
        margin: 0 auto 14px;
        border: 2px solid #3f3f46;
        border-top-color: #34d399;
        border-radius: 50%;
        animation: spin .7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .title { font-size: 15px; font-weight: 600; }
      .sub { margin-top: 6px; font-size: 12px; color: #a1a1aa; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="spinner"></div>
      <div class="title">در حال آماده‌سازی چاپ…</div>
      <div class="sub">لطفاً چند لحظه صبر کنید</div>
    </div>
  </body>
</html>`);
  w.document.close();
  return w;
}

export function writePrintDocument(
  w: Window,
  pngUrl: string,
  label: LabelSettings,
) {
  const settings = resolvePrintSettings(label);
  const safeTitle = "چاپ لیبل";
  const scale = settings.printScalePercent / 100;
  const html = `<!doctype html>
<html lang="fa" dir="rtl">
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
      <img id="labelImg" src="${pngUrl}" alt="label" />
    </div>
    <script>
      const img = document.getElementById('labelImg');
      const startPrint = () => {
        setTimeout(() => {
          window.focus();
          window.print();
        }, 30);
      };
      if (img) {
        if (img.complete) startPrint();
        else img.onload = startPrint;
      }
    </script>
  </body>
</html>`;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
