export const DEFAULT_LABEL_FONT = "Vazirmatn";

export type FontOption = {
  value: string;
  label: string;
  source: "web" | "system";
};

/** فونت‌های وبی که همیشه در اپ لود می‌شوند */
export const WEB_FONTS: FontOption[] = [
  { value: "Vazirmatn", label: "وزیرمتن", source: "web" },
  { value: "Noto Sans Arabic", label: "Noto Sans Arabic", source: "web" },
  { value: "Noto Naskh Arabic", label: "Noto Naskh Arabic", source: "web" },
];

/** فونت‌های سیستمی رایج برای فارسی/عربی که اگر نصب باشند اضافه می‌شوند */
const SYSTEM_FONT_CANDIDATES: FontOption[] = [
  { value: "Tahoma", label: "Tahoma", source: "system" },
  { value: "Arial", label: "Arial", source: "system" },
  { value: "Segoe UI", label: "Segoe UI", source: "system" },
  { value: "Helvetica Neue", label: "Helvetica Neue", source: "system" },
  { value: "Geeza Pro", label: "Geeza Pro", source: "system" },
  { value: "Al Nile", label: "Al Nile", source: "system" },
  { value: "Arial Unicode MS", label: "Arial Unicode MS", source: "system" },
  { value: "DejaVu Sans", label: "DejaVu Sans", source: "system" },
  { value: "Noto Sans", label: "Noto Sans", source: "system" },
  { value: "IRANSans", label: "ایران‌سنس", source: "system" },
  { value: "IRANSansX", label: "ایران‌سنس X", source: "system" },
  { value: "Shabnam", label: "شبنم", source: "system" },
  { value: "Samim", label: "صمیم", source: "system" },
  { value: "Sahel", label: "ساحل", source: "system" },
  { value: "Tanha", label: "تنها", source: "system" },
  { value: "Gandom", label: "گندم", source: "system" },
  { value: "B Nazanin", label: "بی‌نازنین", source: "system" },
  { value: "B Lotus", label: "بی‌لوتوس", source: "system" },
  { value: "Traditional Arabic", label: "Traditional Arabic", source: "system" },
  { value: "Arabic Typesetting", label: "Arabic Typesetting", source: "system" },
];

const LABEL_FONT_STACK = [
  "Vazirmatn",
  "Noto Sans Arabic",
  "Tahoma",
  "Arial",
  "Segoe UI",
  "sans-serif",
].join(", ");

export function fontFamilyCss(fontFamily?: string) {
  if (!fontFamily) return LABEL_FONT_STACK;
  return `"${fontFamily}", ${LABEL_FONT_STACK}`;
}

function isFontAvailable(fontFamily: string): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const sample = "آاابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیmmmmmmlli";
  const baseline = "monospace";
  ctx.font = `72px ${baseline}`;
  const baselineWidth = ctx.measureText(sample).width;
  ctx.font = `72px "${fontFamily}", ${baseline}`;
  return ctx.measureText(sample).width !== baselineWidth;
}

async function queryLocalFontsSafe(): Promise<string[]> {
  const queryLocalFonts = (
    window as Window & {
      queryLocalFonts?: () => Promise<Array<{ family: string }>>;
    }
  ).queryLocalFonts;

  if (typeof queryLocalFonts !== "function") return [];

  try {
    const fonts = await queryLocalFonts();
    return Array.from(new Set(fonts.map((f) => f.family).filter(Boolean)));
  } catch {
    return [];
  }
}

export async function listAvailableFonts(): Promise<FontOption[]> {
  await document.fonts.ready.catch(() => undefined);

  const byValue = new Map<string, FontOption>();
  for (const font of WEB_FONTS) {
    byValue.set(font.value.toLowerCase(), font);
  }

  for (const font of SYSTEM_FONT_CANDIDATES) {
    if (isFontAvailable(font.value)) {
      byValue.set(font.value.toLowerCase(), font);
    }
  }

  const localFamilies = await queryLocalFontsSafe();
  for (const family of localFamilies) {
    const key = family.toLowerCase();
    if (byValue.has(key)) continue;
    byValue.set(key, { value: family, label: family, source: "system" });
  }

  return Array.from(byValue.values()).sort((a, b) => {
    if (a.source !== b.source) return a.source === "web" ? -1 : 1;
    return a.label.localeCompare(b.label, "fa");
  });
}
