import { create } from "zustand"
import type { Template } from "@/types/template"
import { deleteTemplate as deleteFromStorage, loadTemplates, saveTemplates, upsertTemplate } from "@/utils/templateStorage"

type TemplatesState = {
  hydrated: boolean
  templates: Template[]
  hydrate: () => void
  upsert: (template: Template) => void
  remove: (templateId: string) => void
  replaceAll: (templates: Template[]) => void
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  hydrated: false,
  templates: [],
  hydrate: () => {
    if (get().hydrated) return
    set({ templates: loadTemplates(), hydrated: true })
  },
  upsert: (template) => {
    upsertTemplate(template)
    set({ templates: loadTemplates() })
  },
  remove: (templateId) => {
    deleteFromStorage(templateId)
    set({ templates: loadTemplates() })
  },
  replaceAll: (templates) => {
    saveTemplates(templates)
    set({ templates: loadTemplates() })
  },
}))

