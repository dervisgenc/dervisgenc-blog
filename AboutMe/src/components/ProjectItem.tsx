interface ProjectItemProps {
    title: string
    description: string
    link: string
    text?: string
}

export const ProjectItem = ({ title, description, link, text }: ProjectItemProps) => (
    <div
        // Use muted background, adjust hover effect
        className="bg-skin-fill-muted hover:bg-accent p-6 rounded-lg transition-colors transform hover:scale-[1.01] duration-200 border border-border"
    >
        <h4 className="text-xl font-semibold mb-2 text-skin-base">{title}</h4>
        <p className="text-skin-muted mb-4">{description}</p> {/* Use muted text */}
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium">
            {text || "View Project"} {/* Changed default text */}
        </a>
    </div>
)
