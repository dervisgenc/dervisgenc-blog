import type React from "react"

interface SkillBadgeProps {
    children: React.ReactNode

}

export const SkillBadge = ({ children }: SkillBadgeProps) => (
    <span
        // Change background to bg-gray-750 for an intermediate dark shade
        className={"px-3 py-1 rounded-full text-sm font-medium bg-gray-750 text-skin-base border border-border"}
    >
        {children}
    </span>
)
