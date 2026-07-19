import { useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useEditorStore } from "@/stores/editorStore"
import { useTemplatesStore } from "@/stores/templatesStore"
import { createBlankTemplate } from "@/utils/templateFactory"
import EditorToolbar from "@/components/editor/EditorToolbar"
import LabelCanvas from "@/components/editor/LabelCanvas"
import PropertiesPanel from "@/components/editor/PropertiesPanel"

export default function EditorPage() {
  const navigate = useNavigate()
  const { templateId } = useParams()

  const { templates, hydrate, upsert } = useTemplatesStore()
  const { template, setTemplate } = useEditorStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const selected = useMemo(() => {
    if (!templateId) return null
    return templates.find((t) => t.id === templateId) ?? null
  }, [templateId, templates])

  useEffect(() => {
    if (templateId) {
      if (selected) {
        setTemplate(selected)
        return
      }
      const created = createBlankTemplate()
      created.id = templateId
      upsert(created)
      setTemplate(created)
      return
    }

    const fresh = createBlankTemplate()
    upsert(fresh)
    navigate(`/editor/${fresh.id}`, { replace: true })
  }, [navigate, selected, setTemplate, templateId, upsert])

  if (!template) return null

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100">
      <div className="flex h-full flex-col">
        <EditorToolbar />
        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <LabelCanvas />
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </div>
  )
}

