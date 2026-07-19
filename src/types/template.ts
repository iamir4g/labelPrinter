export type LabelSettings = {
  widthMm: number
  heightMm: number
  dpi: number
  safeMarginMm: number
  printMode?: "thermal" | "normal"
  threshold?: number
  darkness?: number
  dithering?: boolean
  printScalePercent?: number
}

export type TextElementData = {
  html: string
  fontFamily?: string
  fontSizePx?: number
  color?: string
  align?: "left" | "center" | "right"
}

export type ImageElementData = {
  src: string
  fit: "contain" | "cover"
}

export type TemplateElementBase = {
  id: string
  xMm: number
  yMm: number
  wMm: number
  hMm: number
  rotateDeg: number
  locked: boolean
}

export type TextTemplateElement = TemplateElementBase & {
  type: "text"
  data: TextElementData
}

export type ImageTemplateElement = TemplateElementBase & {
  type: "image"
  data: ImageElementData
}

export type TemplateElement = TextTemplateElement | ImageTemplateElement

export type Template = {
  id: string
  name: string
  label: LabelSettings
  elements: TemplateElement[]
  meta: {
    createdAt: string
    updatedAt: string
    version: number
  }
}
