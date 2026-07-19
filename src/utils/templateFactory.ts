import type { Template } from "@/types/template"

export function createBlankTemplate(partial?: Partial<Pick<Template, "name" | "label">>): Template {
  const now = new Date().toISOString()
  const widthMm = partial?.label?.widthMm ?? 50
  const heightMm = partial?.label?.heightMm ?? 30

  return {
    id: crypto.randomUUID(),
    name: partial?.name ?? `Label ${widthMm}x${heightMm}`,
    label: {
      widthMm,
      heightMm,
      dpi: partial?.label?.dpi ?? 203,
      safeMarginMm: partial?.label?.safeMarginMm ?? 1,
      printMode: partial?.label?.printMode ?? "thermal",
      threshold: partial?.label?.threshold ?? 165,
      darkness: partial?.label?.darkness ?? 18,
      dithering: partial?.label?.dithering ?? false,
      printScalePercent: partial?.label?.printScalePercent ?? 100,
    },
    elements: [],
    meta: {
      createdAt: now,
      updatedAt: now,
      version: 1,
    },
  }
}
