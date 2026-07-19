import { describe, expect, it } from "vitest"
import { clampNumber, mmToPx, pxToMm, roundTo } from "./units"

describe("units", () => {
  it("converts mm to px and back (dpi=203)", () => {
    const dpi = 203
    const mm = 50
    const px = mmToPx(mm, dpi)
    const mm2 = pxToMm(px, dpi)
    expect(roundTo(mm2, 6)).toBe(roundTo(mm, 6))
  })

  it("clamps numbers", () => {
    expect(clampNumber(10, 0, 5)).toBe(5)
    expect(clampNumber(-1, 0, 5)).toBe(0)
    expect(clampNumber(3, 0, 5)).toBe(3)
  })
})

