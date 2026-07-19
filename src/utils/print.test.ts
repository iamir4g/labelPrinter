import { describe, expect, it } from "vitest"
import { getPrintPixelSize, resolvePrintSettings } from "./print"

describe("print utils", () => {
  it("fills thermal defaults", () => {
    const settings = resolvePrintSettings({
      widthMm: 50,
      heightMm: 30,
      dpi: 203,
      safeMarginMm: 1,
    })

    expect(settings.printMode).toBe("thermal")
    expect(settings.threshold).toBe(165)
    expect(settings.darkness).toBe(18)
    expect(settings.printScalePercent).toBe(100)
  })

  it("returns printer dot size from mm and dpi", () => {
    const size = getPrintPixelSize({
      widthMm: 50,
      heightMm: 30,
      dpi: 203,
      safeMarginMm: 1,
    })

    expect(size.widthPx).toBe(400)
    expect(size.heightPx).toBe(240)
  })
})

