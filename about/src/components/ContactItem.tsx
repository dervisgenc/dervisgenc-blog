import type React from "react"

interface ContactItemProps {
    icon: React.ReactNode
    text: string
    href?: string
    highlight?: boolean
}

export const ContactItem = ({ icon, text, href, highlight = false }: ContactItemProps) => (
    <a
        href={href}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        className={`flex items-center gap-3 ${highlight ? "text-cyan-400 font-medium" : "text-skin-base hover:text-cyan-400"
            } transition-colors group`}
    >
        <span className={`${highlight ? "text-cyan-400" : "text-skin-muted"} group-hover:text-cyan-400 transition-colors`}>
            {icon}
        </span>
        <span>{text}</span>
    </a>
)
