// src/components/ui/RichTextEditor.jsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

export default function RichTextEditor({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Write your description...",
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    immediatelyRender: false, // Prevents Next.js SSR hydration mismatch
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      // Returns "" if empty so required validation works properly
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
  });

  if (!editor) return null;

  const toolbarButtons = [
    {
      label: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      label: "Bullet List",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "Numbered List",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
  ];

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden focus-within:border-black/90 transition-colors duration-300 ${
        disabled ? "opacity-75 pointer-events-none bg-gray-50" : "bg-white"
      }`}
    >
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={btn.action}
              title={btn.label}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                btn.isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>

      {/* Editable Content Area */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
