import { create } from "zustand";
import type { Template, TemplateElement } from "@/types/template";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

type EditorState = {
  template: Template | null;
  selectedElementId: string | null;
  zoom: number;
  past: Template[];
  future: Template[];
  setTemplate: (template: Template) => void;
  setSelectedElementId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  updateTemplateMeta: () => void;
  commit: (next: Template) => void;
  undo: () => void;
  redo: () => void;
  addText: () => void;
  addImage: (src: string) => void;
  updateElement: (elementId: string, patch: Partial<TemplateElement>) => void;
  updateTextHtml: (elementId: string, html: string) => void;
  updateTextStyle: (
    elementId: string,
    patch: {
      fontFamily?: string;
      fontSizePx?: number;
      color?: string;
      align?: "left" | "center" | "right";
    },
  ) => void;
  deleteSelected: () => void;
};

function nowIso() {
  return new Date().toISOString();
}

function updatedTemplate(template: Template): Template {
  return {
    ...template,
    meta: {
      ...template.meta,
      updatedAt: nowIso(),
    },
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  template: null,
  selectedElementId: null,
  zoom: 1,
  past: [],
  future: [],
  setTemplate: (template) =>
    set({ template, selectedElementId: null, past: [], future: [] }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => set({ zoom }),
  updateTemplateMeta: () => {
    const current = get().template;
    if (!current) return;
    set({ template: updatedTemplate(current) });
  },
  commit: (next) => {
    const current = get().template;
    if (!current) {
      set({ template: updatedTemplate(next), past: [], future: [] });
      return;
    }
    set((state) => ({
      template: updatedTemplate(next),
      past: [...state.past, current],
      future: [],
    }));
  },
  undo: () => {
    const { past, template, future } = get();
    if (!template) return;
    const prev = past[past.length - 1];
    if (!prev) return;
    set({
      template: prev,
      past: past.slice(0, -1),
      future: [template, ...future],
      selectedElementId: null,
    });
  },
  redo: () => {
    const { past, template, future } = get();
    if (!template) return;
    const next = future[0];
    if (!next) return;
    set({
      template: next,
      past: [...past, template],
      future: future.slice(1),
      selectedElementId: null,
    });
  },
  addText: () => {
    const template = get().template;
    if (!template) return;
    const el: TemplateElement = {
      id: crypto.randomUUID(),
      type: "text",
      xMm: 5,
      yMm: 5,
      wMm: Math.min(40, Math.max(20, template.label.widthMm - 10)),
      hMm: 10,
      rotateDeg: 0,
      locked: false,
      data: {
        html: "<p>متن</p>",
        fontSizePx: 14,
        color: "#111111",
        align: "left",
      },
    };
    const next: Template = {
      ...template,
      elements: [...template.elements, el],
    };
    get().commit(next);
    set({ selectedElementId: el.id });
  },
  addImage: (src) => {
    const template = get().template;
    if (!template) return;
    const el: TemplateElement = {
      id: crypto.randomUUID(),
      type: "image",
      xMm: 5,
      yMm: 5,
      wMm: 20,
      hMm: 20,
      rotateDeg: 0,
      locked: false,
      data: { src, fit: "contain" },
    };
    const next: Template = {
      ...template,
      elements: [...template.elements, el],
    };
    get().commit(next);
    set({ selectedElementId: el.id });
  },
  updateElement: (elementId, patch) => {
    const template = get().template;
    if (!template) return;
    const nextElements = template.elements.map((el) => {
      if (el.id !== elementId) return el;
      return { ...el, ...patch } as TemplateElement;
    });
    get().commit({ ...template, elements: nextElements });
  },
  updateTextHtml: (elementId, html) => {
    const template = get().template;
    if (!template) return;
    const nextElements = template.elements.map((el) => {
      if (el.id !== elementId) return el;
      if (el.type !== "text") return el;
      return { ...el, data: { ...el.data, html: sanitizeHtml(html) } };
    });
    get().commit({ ...template, elements: nextElements });
  },
  updateTextStyle: (elementId, patch) => {
    const template = get().template;
    if (!template) return;
    const nextElements = template.elements.map((el) => {
      if (el.id !== elementId) return el;
      if (el.type !== "text") return el;
      return { ...el, data: { ...el.data, ...patch } };
    });
    get().commit({ ...template, elements: nextElements });
  },
  deleteSelected: () => {
    const template = get().template;
    const id = get().selectedElementId;
    if (!template || !id) return;
    const next: Template = {
      ...template,
      elements: template.elements.filter((el) => el.id !== id),
    };
    get().commit(next);
    set({ selectedElementId: null });
  },
}));
