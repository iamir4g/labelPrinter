const allowedTags = new Set(["p", "br", "strong", "em", "u", "span"])
const allowedAttrs = new Set(["style"])

function sanitizeStyle(style: string) {
  const safe: string[] = []
  const parts = style.split(";").map((p) => p.trim()).filter(Boolean)
  for (const part of parts) {
    const [rawKey, rawValue] = part.split(":").map((p) => p.trim())
    if (!rawKey || !rawValue) continue
    const key = rawKey.toLowerCase()
    if (key === "color" || key === "text-align" || key === "font-weight" || key === "font-style" || key === "text-decoration") {
      safe.push(`${key}:${rawValue}`)
    }
  }
  return safe.join(";")
}

export function sanitizeHtml(input: string) {
  if (typeof window === "undefined") return input
  const parser = new DOMParser()
  const doc = parser.parseFromString(input, "text/html")

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT)
  const toRemove: Element[] = []

  let current = walker.nextNode() as Element | null
  while (current) {
    const tag = current.tagName.toLowerCase()
    if (!allowedTags.has(tag)) {
      toRemove.push(current)
      current = walker.nextNode() as Element | null
      continue
    }

    for (const attr of Array.from(current.attributes)) {
      const name = attr.name.toLowerCase()
      if (name.startsWith("on")) {
        current.removeAttribute(attr.name)
        continue
      }
      if (!allowedAttrs.has(name)) {
        current.removeAttribute(attr.name)
        continue
      }
      if (name === "style") {
        const sanitized = sanitizeStyle(attr.value)
        if (sanitized) current.setAttribute("style", sanitized)
        else current.removeAttribute("style")
      }
    }

    current = walker.nextNode() as Element | null
  }

  for (const el of toRemove) {
    const parent = el.parentElement
    if (!parent) continue
    const fragment = doc.createDocumentFragment()
    while (el.firstChild) fragment.appendChild(el.firstChild)
    parent.replaceChild(fragment, el)
  }

  return doc.body.innerHTML
}

