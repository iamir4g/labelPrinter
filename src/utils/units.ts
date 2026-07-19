export function mmToPx(mm: number, dpi: number) {
  return (mm / 25.4) * dpi
}

export function pxToMm(px: number, dpi: number) {
  return (px / dpi) * 25.4
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

