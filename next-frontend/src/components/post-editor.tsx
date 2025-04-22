"use client"

import { useEffect, useRef } from "react"
import { Editor } from "@tinymce/tinymce-react"

interface PostEditorProps {
  value: string
  onChange: (content: string) => void
}

export default function PostEditor({ value, onChange }: PostEditorProps) {
  const editorRef = useRef<any>(null)

  useEffect(() => {
    // Clean up TinyMCE on component unmount
    return () => {
      if (editorRef.current && editorRef.current.editor) {
        editorRef.current.editor.destroy()
      }
    }
  }, [])

  return (
    <div className="border rounded-md">
      <Editor
        apiKey="no-api-key" // In a real app, you would use your TinyMCE API key
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={value}
        onEditorChange={(content) => onChange(content)}
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
          skin: window.matchMedia("(prefers-color-scheme: dark)").matches ? "oxide-dark" : "oxide",
          content_css: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default",
        }}
      />
    </div>
  )
}
