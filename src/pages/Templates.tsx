import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Copy, Download, Pencil, Plus, Search, Trash2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTemplatesStore } from "@/stores/templatesStore"
import { createBlankTemplate } from "@/utils/templateFactory"
import type { Template } from "@/types/template"

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function formatSizeMm(t: Template) {
  return `${t.label.widthMm}×${t.label.heightMm} mm`
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const { templates, hydrate, upsert, remove, replaceAll } = useTemplatesStore()

  const [query, setQuery] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return templates
    return templates.filter((t) => t.name.toLowerCase().includes(q))
  }, [query, templates])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Template Library
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">کتابخانه تمپلیت‌ها</h1>
              <p className="max-w-2xl text-sm text-zinc-400">
                تمپلیت بساز، ذخیره کن، خروجی بگیر و روی هر پرینتری با Print سیستم چاپ کن.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950",
                  "hover:bg-emerald-400 active:bg-emerald-600",
                )}
                onClick={() => {
                  const tpl = createBlankTemplate()
                  upsert(tpl)
                  navigate(`/editor/${tpl.id}`)
                }}
              >
                <Plus className="h-4 w-4" />
                تمپلیت جدید
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                onClick={() => downloadJson(`templates-${new Date().toISOString().slice(0, 10)}.json`, templates)}
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Import
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    try {
                      const parsed = JSON.parse(String(reader.result ?? ""))
                      if (!Array.isArray(parsed)) {
                        setNotice("فرمت فایل درست نیست (باید آرایه‌ای از تمپلیت‌ها باشد).")
                        return
                      }
                      const imported = parsed as Template[]
                      const merged = [...templates]
                      for (const t of imported) {
                        if (!t?.id || !t?.name || !t?.label) continue
                        const idx = merged.findIndex((m) => m.id === t.id)
                        if (idx >= 0) merged[idx] = t
                        else merged.unshift(t)
                      }
                      replaceAll(merged)
                      setNotice(`Import انجام شد. تعداد تمپلیت‌ها: ${merged.length}`)
                    } catch {
                      setNotice("فایل JSON معتبر نیست.")
                    } finally {
                      e.target.value = ""
                    }
                  }
                  reader.readAsText(file)
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو بر اساس نام تمپلیت…"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                />
              </div>
              <div className="text-xs text-zinc-500">{filtered.length} / {templates.length}</div>
            </div>

            {notice ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-300">
                {notice}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((t) => (
              <div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-zinc-100">{t.name}</div>
                    <div className="text-xs text-zinc-500">{formatSizeMm(t)}</div>
                    <div className="text-xs text-zinc-600">آخرین ویرایش: {new Date(t.meta.updatedAt).toLocaleString("fa-IR")}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-900"
                      onClick={() => navigate(`/editor/${t.id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      ویرایش
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-900"
                      onClick={() => {
                        const now = new Date().toISOString()
                        const dup: Template = {
                          ...t,
                          id: crypto.randomUUID(),
                          name: `${t.name} (Copy)`,
                          meta: { ...t.meta, createdAt: now, updatedAt: now },
                        }
                        upsert(dup)
                        navigate(`/editor/${dup.id}`)
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      کپی
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1 text-xs text-rose-200 hover:bg-zinc-900"
                      onClick={() => remove(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center text-sm text-zinc-400">
              چیزی پیدا نشد. یک تمپلیت جدید بساز یا Import کن.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

