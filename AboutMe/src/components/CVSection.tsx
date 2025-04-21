import type React from "react"

interface CVSectionProps {
    title: string
    children: React.ReactNode
}

export const CVSection = ({ title, children }: CVSectionProps) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-cyan-400">{title}</h3>
        {children}
    </div>
)
