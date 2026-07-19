import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import SelectedElementPanel from "@/components/editor/SelectedElementPanel";
import { clampNumber, roundTo } from "@/utils/units";

function parseNum(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function labelLine(label: string, value: string) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
      <span>{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
  );
}

export default function PropertiesPanel() {
  const { template, selectedElementId, commit, deleteSelected } =
    useEditorStore();

  const selected = useMemo(() => {
    if (!template || !selectedElementId) return null;
    return template.elements.find((e) => e.id === selectedElementId) ?? null;
  }, [selectedElementId, template]);

  if (!template) return null;

  return (
    <div className="w-[360px] border-l border-zinc-900 bg-zinc-950/70 backdrop-blur">
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-900 px-5 py-4">
          <div className="text-sm font-medium text-zinc-100">Properties</div>
          <div className="mt-2 space-y-1">
            {labelLine(
              "سایز",
              `${template.label.widthMm}×${template.label.heightMm} mm`,
            )}
            {labelLine("DPI", `${template.label.dpi}`)}
            {labelLine("Safe margin", `${template.label.safeMarginMm} mm`)}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="text-xs font-medium text-zinc-300">
                تنظیمات لیبل
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <div className="text-xs text-zinc-500">عرض (mm)</div>
                  <input
                    defaultValue={template.label.widthMm}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                    onBlur={(e) => {
                      const widthMm = roundTo(
                        clampNumber(
                          parseNum(e.target.value, template.label.widthMm),
                          5,
                          200,
                        ),
                        2,
                      );
                      commit({
                        ...template,
                        label: { ...template.label, widthMm },
                      });
                    }}
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs text-zinc-500">ارتفاع (mm)</div>
                  <input
                    defaultValue={template.label.heightMm}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                    onBlur={(e) => {
                      const heightMm = roundTo(
                        clampNumber(
                          parseNum(e.target.value, template.label.heightMm),
                          5,
                          200,
                        ),
                        2,
                      );
                      commit({
                        ...template,
                        label: { ...template.label, heightMm },
                      });
                    }}
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs text-zinc-500">DPI</div>
                  <input
                    defaultValue={template.label.dpi}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                    onBlur={(e) => {
                      const dpi = clampNumber(
                        parseNum(e.target.value, template.label.dpi),
                        72,
                        600,
                      );
                      commit({
                        ...template,
                        label: { ...template.label, dpi },
                      });
                    }}
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs text-zinc-500">Safe margin (mm)</div>
                  <input
                    defaultValue={template.label.safeMarginMm}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                    onBlur={(e) => {
                      const safeMarginMm = roundTo(
                        clampNumber(
                          parseNum(e.target.value, template.label.safeMarginMm),
                          0,
                          20,
                        ),
                        2,
                      );
                      commit({
                        ...template,
                        label: { ...template.label, safeMarginMm },
                      });
                    }}
                  />
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-zinc-300">
                  عنصر انتخاب‌شده
                </div>
                {selected ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-rose-200 hover:bg-zinc-900"
                    onClick={() => deleteSelected()}
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </button>
                ) : null}
              </div>

              {!selected ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-6 text-xs text-zinc-400">
                  برای دیدن تنظیمات، یک عنصر را انتخاب کن.
                </div>
              ) : (
                <SelectedElementPanel selected={selected} />
              )}
            </section>
          </div>
        </div>

        <div className="border-t border-zinc-900 px-5 py-4">
          <div className="text-xs text-zinc-500">
            برای چاپ دقیق: در Print سیستم Scale را روی 100% بگذار و Fit-to-page
            را خاموش کن.
          </div>
        </div>
      </div>
    </div>
  );
}
