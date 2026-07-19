import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline as UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  onChange: (html: string) => void;
};

function toolBtn(active: boolean) {
  return cn(
    "inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-1 text-zinc-200 hover:bg-zinc-900",
    active && "border-emerald-500/60 bg-emerald-500/10 text-emerald-200",
  );
}

export default function TextRichEditorPanel({ html, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false, underline: false }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: html,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[110px] rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-sm text-zinc-100 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current === html) return;
    editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, html]);

  const canUse = useMemo(() => Boolean(editor), [editor]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={toolBtn(Boolean(editor?.isActive("bold")))}
          disabled={!canUse}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          className={toolBtn(Boolean(editor?.isActive("italic")))}
          disabled={!canUse}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          className={toolBtn(Boolean(editor?.isActive("underline")))}
          disabled={!canUse}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-zinc-800" />

        <button
          className={toolBtn(editor?.isActive({ textAlign: "left" }) ?? false)}
          disabled={!canUse}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          className={toolBtn(
            editor?.isActive({ textAlign: "center" }) ?? false,
          )}
          disabled={!canUse}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          className={toolBtn(editor?.isActive({ textAlign: "right" }) ?? false)}
          disabled={!canUse}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
