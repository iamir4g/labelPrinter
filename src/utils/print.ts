import type { LabelSettings } from "@/types/template"
import { clampNumber, mmToPx, roundTo } from "@/utils/units"

export type ResolvedPrintSettings = {
  widthMm: number
  heightMm: number
  dpi: number
  safeMarginMm: number
  printMode: "thermal" | "normal"
  threshold: number
  darkness: number
  dithering: boolean
  printScalePercent: number
}

export function resolvePrintSettings(label: LabelSettings): ResolvedPrintSettings {
  return {
    widthMm: roundTo(label.widthMm, 2),
    heightMm: roundTo(label.heightMm, 2),
    dpi: clampNumber(label.dpi, 72, 600),
    safeMarginMm: roundTo(clampNumber(label.safeMarginMm, 0, 20), 2),
    printMode: label.printMode ?? "thermal",
    threshold: clampNumber(label.threshold ?? 165, 0, 255),
    darkness: clampNumber(label.darkness ?? 18, -100, 100),
    dithering: label.dithering ?? false,
    printScalePercent: clampNumber(label.printScalePercent ?? 100, 50, 150),
  }
}

export function getPrintPixelSize(label: LabelSettings) {
  const settings = resolvePrintSettings(label)
  return {
    widthPx: Math.max(1, Math.round(mmToPx(settings.widthMm, settings.dpi))),
    heightPx: Math.max(1, Math.round(mmToPx(settings.heightMm, settings.dpi))),
  }
}

