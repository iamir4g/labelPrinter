import { useEffect, useState } from "react"
import { AlignCenter, AlignLeft, AlignRight, Lock, Unlock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/stores/editorStore"
import type { TemplateElement } from "@/types/template"
import TextRichEditorPanel from "@/components/editor/TextRichEditorPanel"
import { clampNumber, roundTo } from "@/utils/units"
import {
  DEFAULT_LABEL_FONT,
  listAvailableFonts,
  type FontOption,
} from "@/utils/fonts"

function parseNum(value: string, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export default function SelectedElementPanel({ selected }: { selected: TemplateElement }) {
  const { template, updateElement, updateTextHtml, updateTextStyle } = useEditorStore()
  const [fonts, setFonts] = useState<FontOption[]>([])

  useEffect(() => {
    let cancelled = false
    listAvailableFonts().then((next) => {
      if (!cancelled) setFonts(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!template) return null

  const currentFont = selected.type === "text" ? selected.data.fontFamily ?? DEFAULT_LABEL_FONT : DEFAULT_LABEL_FONT
  const fontOptions =
    selected.type === "text" && currentFont && !fonts.some((f) => f.value === currentFont)
      ? [{ value: currentFont, label: currentFont, source: "system" as const }, ...fonts]
      : fonts

  return (
    <div className="space-y-4" dir="rtl" lang="fa">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <div className="text-xs text-zinc-500">x (mm)</div>
          <input
            dir="ltr"
            defaultValue={selected.xMm}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
            onBlur={(e) => updateElement(selected.id, { xMm: roundTo(parseNum(e.target.value, selected.xMm), 2) })}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs text-zinc-500">y (mm)</div>
          <input
            dir="ltr"
            defaultValue={selected.yMm}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
            onBlur={(e) => updateElement(selected.id, { yMm: roundTo(parseNum(e.target.value, selected.yMm), 2) })}
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs text-zinc-500">w (mm)</div>
          <input
            dir="ltr"
            defaultValue={selected.wMm}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
            onBlur={(e) =>
              updateElement(selected.id, {
                wMm: roundTo(clampNumber(parseNum(e.target.value, selected.wMm), 1, template.label.widthMm), 2),
              })
            }
          />
        </label>
        <label className="space-y-1">
          <div className="text-xs text-zinc-500">h (mm)</div>
          <input
            dir="ltr"
            defaultValue={selected.hMm}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
            onBlur={(e) =>
              updateElement(selected.id, {
                hMm: roundTo(clampNumber(parseNum(e.target.value, selected.hMm), 1, template.label.heightMm), 2),
              })
            }
          />
        </label>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 px-4 py-3">
        <div className="text-xs text-zinc-300">{selected.type === "text" ? "جعبه متن" : "تصویر"}</div>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900",
            selected.locked && "text-amber-200",
          )}
          onClick={() => updateElement(selected.id, { locked: !selected.locked })}
        >
          {selected.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          {selected.locked ? "قفل" : "باز"}
        </button>
      </div>

      {selected.type === "image" ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-300">تناسب تصویر</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900",
                selected.data.fit === "contain" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
              )}
              onClick={() => updateElement(selected.id, { data: { ...selected.data, fit: "contain" } })}
            >
              contain
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900",
                selected.data.fit === "cover" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
              )}
              onClick={() => updateElement(selected.id, { data: { ...selected.data, fit: "cover" } })}
            >
              cover
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block space-y-1">
            <div className="text-xs text-zinc-500">فونت</div>
            <select
              value={currentFont}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
              onChange={(e) => updateTextStyle(selected.id, { fontFamily: e.target.value })}
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: `"${font.value}"` }}>
                  {font.label}
                  {font.source === "system" ? " (سیستم)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-xs text-zinc-500">اندازه فونت (px)</div>
              <input
                dir="ltr"
                defaultValue={selected.data.fontSizePx ?? 14}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                onBlur={(e) =>
                  updateTextStyle(selected.id, {
                    fontSizePx: clampNumber(parseNum(e.target.value, selected.data.fontSizePx ?? 14), 6, 200),
                  })
                }
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-zinc-500">رنگ</div>
              <input
                dir="ltr"
                defaultValue={selected.data.color ?? "#111111"}
                className="h-[42px] w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                onBlur={(e) => updateTextStyle(selected.id, { color: e.target.value })}
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-300">تراز</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900",
                  (selected.data.align ?? "right") === "right" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
                )}
                onClick={() => updateTextStyle(selected.id, { align: "right" })}
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900",
                  selected.data.align === "center" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
                )}
                onClick={() => updateTextStyle(selected.id, { align: "center" })}
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900",
                  selected.data.align === "left" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
                )}
                onClick={() => updateTextStyle(selected.id, { align: "left" })}
              >
                <AlignLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-300">متن غنی</div>
            <TextRichEditorPanel
              key={selected.id}
              html={selected.data.html}
              fontFamily={currentFont}
              onChange={(html) => updateTextHtml(selected.id, html)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
