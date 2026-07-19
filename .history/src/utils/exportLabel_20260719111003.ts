import { toPng } from "html-to-image"

export async function renderLabelToPng(node: HTMLElement) {
  return toPng(node, { cacheBust: true, pixelRatio: 1, backgroundColor: "#ffffff" })
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function openEmptyPrintWindow() {
  const w = window.open("", "_blank")
  if (!w) return null
  w.document.open()
  w.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Preparing…</title></head><body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial; padding: 16px;">Preparing print…</body></html>`)
  w.document.close()
  return w
}

export function writePrintDocument(w: Window, pngDataUrl: string, widthMm: number, heightMm: number) {
  const safeTitle = "Label Print"
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      @page { margin: 0; }
      html, body { padding: 0; margin: 0; background: white; }
      .wrap { width: ${widthMm}mm; height: ${heightMm}mm; }
      img { width: 100%; height: 100%; display: block; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img id="labelImg" src="${pngDataUrl}" alt="label" />
    </div>
    <script>
      const img = document.getElementById('labelImg');
      if (img) {
        img.onload = () => {
          setTimeout(() => {
            window.focus();
            window.print();
          }, 50);
        };
      }
    </script>
  </body>
</html>`
  w.document.open()
  w.document.write(html)
  w.document.close()
}
