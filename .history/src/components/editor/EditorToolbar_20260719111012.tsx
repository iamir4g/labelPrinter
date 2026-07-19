import { useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ImagePlus, Printer, Redo2, Save, Type, Undo2, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCanvasStore } from "@/stores/canvasStore"
import { useEditorStore } from "@/stores/editorStore"
import { useTemplatesStore } from "@/stores/templatesStore"
import { downloadDataUrl, openEmptyPrintWindow, renderLabelToPng, writePrintDocument } from "@/utils/exportLabel"
import { clampNumber, roundTo } from "@/utils/units"

function buttonClass(variant: "primary" | "ghost" = "ghost") {
  if (variant === "primary") {
    return cn(
      "inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950",
      "hover:bg-emerald-400 active:bg-emerald-600",
    )
  }
  return "inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
}

export default function EditorToolbar() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement | null>(null)

  const { canvasEl } = useCanvasStore()
  const { template, commit, addText, addImage, undo, redo, zoom, setZoom, past, future } = useEditorStore()
  const { upsert } = useTemplatesStore()

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const title = useMemo(() => template?.name ?? "Untitled", [template?.name])

  if (!template) return null

  return (
    <div className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
        <button className={buttonClass()} onClick={() => navigate("/templates")}>
          <ArrowLeft className="h-4 w-4" />
          تمپلیت‌ها
        </button>

        <div className="min-w-0 flex-1">
          <input
            className="w-full truncate rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            value={title}
            onChange={(e) => commit({ ...template, name: e.target.value })}
            placeholder="نام تمپلیت…"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className={buttonClass()} onClick={() => addText()}>
            <Type className="h-4 w-4" />
            متن
          </button>

          <button className={buttonClass()} onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            عکس
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                const src = String(reader.result ?? "")
                if (src) addImage(src)
                e.target.value = ""
              }
              reader.readAsDataURL(file)
            }}
          />

          <button className={cn(buttonClass(), !canUndo && "opacity-50")} disabled={!canUndo} onClick={() => undo()}>
            <Undo2 className="h-4 w-4" />
          </button>
          <button className={cn(buttonClass(), !canRedo && "opacity-50")} disabled={!canRedo} onClick={() => redo()}>
            <Redo2 className="h-4 w-4" />
          </button>

          <button
            className={buttonClass("primary")}
            onClick={() => {
              upsert(template)
            }}
          >
            <Save className="h-4 w-4" />
            ذخیره
          </button>

          <button
            className={cn(buttonClass(), !canvasEl && "opacity-50")}
            disabled={!canvasEl}
            onClick={async () => {
              if (!canvasEl) return
              const dataUrl = await renderLabelToPng(canvasEl)
              downloadDataUrl(`${template.name}.png`, dataUrl)
            }}
          >
            <ZoomIn className="h-4 w-4" />
            PNG
          </button>

          <button
            className={cn(buttonClass(), !canvasEl && "opacity-50")}
            disabled={!canvasEl}
            onClick={async () => {
              if (!canvasEl) return
              const w = openEmptyPrintWindow()
              const dataUrl = await renderLabelToPng(canvasEl)
              if (w) writePrintDocument(w, dataUrl, template.label.widthMm, template.label.heightMm)
            }}
          >
            <Printer className="h-4 w-4" />
            چاپ
          </button>

          <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2 md:flex">
            <span className="text-xs text-zinc-400">Zoom</span>
            <input
              type="range"
              min={0.25}
              max={2}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(clampNumber(Number(e.target.value), 0.25, 2))}
            />
            <span className="w-12 text-right text-xs text-zinc-300">{roundTo(zoom * 100, 0)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
