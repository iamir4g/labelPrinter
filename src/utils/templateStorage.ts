import type { Template } from "@/types/template"

const STORAGE_KEY = "lable.templates.v1"

export function loadTemplates(): Template[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Template[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveTemplates(all: Template[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function upsertTemplate(template: Template) {
  const all = loadTemplates()
  const idx = all.findIndex((t) => t.id === template.id)
  if (idx >= 0) all[idx] = template
  else all.unshift(template)
  saveTemplates(all)
}

export function deleteTemplate(templateId: string) {
  const all = loadTemplates().filter((t) => t.id !== templateId)
  saveTemplates(all)
}

