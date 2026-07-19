import { create } from "zustand"

type CanvasState = {
  canvasEl: HTMLDivElement | null
  setCanvasEl: (el: HTMLDivElement | null) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvasEl: null,
  setCanvasEl: (canvasEl) =>
    set((state) => {
      if (state.canvasEl === canvasEl) return state
      return { canvasEl }
    }),
}))
