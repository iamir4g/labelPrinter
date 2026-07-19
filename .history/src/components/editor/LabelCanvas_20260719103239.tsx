import { useEffect, useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvasStore";
import { useEditorStore } from "@/stores/editorStore";
import { mmToPx, pxToMm, roundTo } from "@/utils/units";

export default function LabelCanvas() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { setCanvasEl } = useCanvasStore();
  const {
    template,
    zoom,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    deleteSelected,
  } = useEditorStore();

  const canvasSize = useMemo(() => {
    if (!template) return { w: 0, h: 0 };
    return {
      w: mmToPx(template.label.widthMm, template.label.dpi),
      h: mmToPx(template.label.heightMm, template.label.dpi),
    };
  }, [template]);

  const safeInset = useMemo(() => {
    if (!template) return 0;
    return mmToPx(template.label.safeMarginMm, template.label.dpi);
  }, [template]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if (e.key === "Escape") setSelectedElementId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected, setSelectedElementId]);

  if (!template) return null;

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="flex min-h-full items-start justify-center px-10 py-10">
        <div
          className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            <div
              ref={(node) => {
                wrapperRef.current = node;
                setCanvasEl(node);
              }}
              className="relative bg-white"
              style={{ width: canvasSize.w, height: canvasSize.h }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setSelectedElementId(null);
              }}
            >
              <div
                className="pointer-events-none absolute border border-dashed border-zinc-300"
                style={{
                  left: safeInset,
                  top: safeInset,
                  right: safeInset,
                  bottom: safeInset,
                }}
              />

              {template.elements.map((el) => {
                const xPx = mmToPx(el.xMm, template.label.dpi);
                const yPx = mmToPx(el.yMm, template.label.dpi);
                const wPx = mmToPx(el.wMm, template.label.dpi);
                const hPx = mmToPx(el.hMm, template.label.dpi);
                const selected = el.id === selectedElementId;

                return (
                  <Rnd
                    key={el.id}
                    size={{ width: wPx, height: hPx }}
                    position={{ x: xPx, y: yPx }}
                    scale={zoom}
                    disableDragging={el.locked}
                    enableResizing={!el.locked}
                    bounds="parent"
                    onMouseDown={() => setSelectedElementId(el.id)}
                    onDragStop={(_, d) => {
                      updateElement(el.id, {
                        xMm: roundTo(pxToMm(d.x, template.label.dpi), 2),
                        yMm: roundTo(pxToMm(d.y, template.label.dpi), 2),
                      });
                    }}
                    onResizeStop={(_, __, ref, ___, position) => {
                      const width = ref.offsetWidth;
                      const height = ref.offsetHeight;
                      updateElement(el.id, {
                        xMm: roundTo(pxToMm(position.x, template.label.dpi), 2),
                        yMm: roundTo(pxToMm(position.y, template.label.dpi), 2),
                        wMm: roundTo(pxToMm(width, template.label.dpi), 2),
                        hMm: roundTo(pxToMm(height, template.label.dpi), 2),
                      });
                    }}
                    className={cn(selected ? "z-20" : "z-10")}
                  >
                    <div
                      className={cn(
                        "h-full w-full overflow-hidden",
                        selected
                          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white"
                          : "ring-1 ring-transparent",
                      )}
                      style={{ transform: `rotate(${el.rotateDeg}deg)` }}
                    >
                      {el.type === "text" ? (
                        <div
                          className="h-full w-full select-none px-1 py-0.5 text-[12px] leading-tight text-zinc-950"
                          style={{
                            fontFamily: el.data.fontFamily,
                            fontSize: el.data.fontSizePx
                              ? `${el.data.fontSizePx}px`
                              : undefined,
                            color: el.data.color,
                            textAlign: el.data.align,
                          }}
                          dangerouslySetInnerHTML={{ __html: el.data.html }}
                        />
                      ) : (
                        <img
                          src={el.data.src}
                          alt=""
                          draggable={false}
                          className={cn(
                            "h-full w-full",
                            el.data.fit === "contain"
                              ? "object-contain"
                              : "object-cover",
                          )}
                        />
                      )}
                    </div>
                  </Rnd>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
