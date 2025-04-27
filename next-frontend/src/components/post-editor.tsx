"use client"

import { useEffect, useRef } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { useTheme } from "next-themes" // Import useTheme

interface PostEditorProps {
  value: string
  onChange: (content: string) => void
}

export default function PostEditor({ value, onChange }: PostEditorProps) {
  const editorRef = useRef<any>(null)
  const { resolvedTheme } = useTheme() // Get the resolved theme (light or dark)

  // Determine skin and content CSS based on the theme
  const skin = resolvedTheme === "dark" ? "oxide-dark" : "oxide"
  const contentCss = resolvedTheme === "dark" ? "dark" : "default"

  // No need for useEffect cleanup with the key prop approach for theme changes

  return (
    <div className="border rounded-md">
      <Editor
        // Add key prop based on theme to force re-render on theme change
        key={resolvedTheme}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""}
        onInit={(evt, editor) => (editorRef.current = editor)}
        // Use value prop for controlled component behavior
        value={value}
        onEditorChange={(content, editor) => onChange(content)} // Pass content to parent
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          // Dynamically set skin and content_css
          skin: skin,
          content_css: contentCss,
        }}
      />
    </div>
  )
}
