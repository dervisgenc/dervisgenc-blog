interface ExperienceItemProps {
    title: string
    company: string
    period: string
    description: string
}

export const ExperienceItem = ({ title, company, period, description }: ExperienceItemProps) => (
    <div className="relative pb-8"> {/* Add padding bottom for spacing */}
        {/* Use theme border and background colors */}
        <div className="absolute -left-[23px] top-1.5 h-4 w-4 rounded-full border-2 border-border bg-background"></div>
        <h4 className="text-xl font-semibold text-skin-base">{title}</h4>
        <p className="text-skin-muted">
            {company} | {period}
        </p>
        <p className="text-skin-base mt-2">{description}</p>
    </div>
)
