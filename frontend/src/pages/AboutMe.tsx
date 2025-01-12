import Header from "@/components/Header";
import { useDarkMode } from "@/components/context/DarkModeContext";
import { GitHubLogoIcon, InstagramLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Linkedin, Mail, MapPin, Globe, } from "lucide-react";

export default function AboutMe() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className={isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}>
            <div className={`${isDarkMode
                ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900'
                : 'bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100'
                } min-h-screen`}>

                <div className="p-4">
                    <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                </div>

                <div className="flex items-center min-h-[calc(100vh-100px)] justify-center p-4">
                    <div className={`container max-w-6xl mx-auto ${isDarkMode
                        ? 'bg-gray-800 bg-opacity-50'
                        : 'bg-white bg-opacity-75'
                        } backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden`}>
                        <div className="grid md:grid-cols-2 gap-8 p-8">
                            <div className="space-y-6">
                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-cyan-400 mx-auto md:mx-0">
                                    <img src="/portre.jpg" alt="Derviş Genç" className="w-full h-full object-cover" />
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent text-center md:text-left">
                                    Derviş Genç
                                </h1>
                                <p className={`text-xl md:text-2xl leading-relaxed mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'
                                    }`}>
                                    Senior Computer Engineering student at Istanbul Technical University with expertise in C/C++ and Go, and a growing interest in Python, React, and C#. Passionate about cybersecurity, software development, and Linux systems, with a focus on network/web security and malware analysis.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {['C/C++', 'Go', 'Python', 'React', 'Linux', 'Cybersecurity'].map((skill) => (
                                        <SkillBadge key={skill} isDarkMode={isDarkMode}>{skill}</SkillBadge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-8 flex items-center justify-center">
                                <div className={`${isDarkMode
                                    ? 'bg-gray-700 bg-opacity-50'
                                    : 'bg-gray-100 bg-opacity-50'
                                    } p-6 rounded-lg w-full`}>
                                    <h2 className="text-2xl font-bold mb-4 text-cyan-400 text-center">Connect with Me</h2>
                                    <div className="space-y-4">
                                        <ContactItem isDarkMode={isDarkMode} icon={<Mail className="text-purple-400 h-5 w-5" />} text="0dervisgenc@gmail.com" href="mailto:0dervisgenc@gmail.com" />
                                        <ContactItem isDarkMode={isDarkMode} icon={<MapPin className="text-red-400 h-5 w-5" />} text="Istanbul, Turkey" href={undefined} />
                                        <ContactItem isDarkMode={isDarkMode} icon={<GitHubLogoIcon className="text-gray-400 h-5 w-5" />} text="github.com/dervisgenc" href="https://github.com/dervisgenc" />
                                        <ContactItem isDarkMode={isDarkMode} icon={<Linkedin className="text-blue-400 h-5 w-5" />} text="linkedin.com/in/dervisgenc" href="https://www.linkedin.com/in/dervisgenc/" />
                                        <ContactItem isDarkMode={isDarkMode} icon={<InstagramLogoIcon className="text-green-400 h-5 w-5" />} text="Derviş Genç" href="https://www.instagram.com/dervis_genc/" />
                                        <ContactItem isDarkMode={isDarkMode} icon={<TwitterLogoIcon className="text-green-400 h-5 w-5" />} text="Derviş Genç" href="https://x.com/1sabredendervis" />
                                        <ContactItem isDarkMode={isDarkMode} icon={<Globe className="text-cyan-400 h-5 w-5" />} text="dervisgenc.com" href="https://www.dervisgenc.com" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className={`min-h-screen py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        Experience & Skills
                    </h2>

                    <div className="space-y-16">
                        <CVSection title="Work Experience" isDarkMode={isDarkMode}>
                            <ExperienceItem
                                title="Cybersecurity Part-Time Working Student"
                                company="Siemens Advanta"
                                period="Jan 2024 - Present"
                                description="Contributed to risk and vulnerability management, incident management, and developed security policies in Information Security. Gained hands-on experience in Secure Development Lifecycle (SDL) processes in Product and Solution Secuirty."
                                isDarkMode={isDarkMode}
                            />
                            <div className="my-4"></div>
                            <ExperienceItem
                                title="Freelance Web Developer"
                                company="Vision Base"
                                period="Oct 2024 - Nov 2024"
                                description="Developed an interactive corporate website using React, featuring video integration and user-focused design."
                                isDarkMode={isDarkMode}
                            />
                        </CVSection>

                        <CVSection title="Projects" isDarkMode={isDarkMode}>
                            <ProjectItem
                                title="BeeHub"
                                description="Cross-platform desktop app for ITU students, featuring a React/TypeScript UI and Go-based backend."
                                link="https://github.com/ITU-BeeHub"
                                isDarkMode={isDarkMode}
                            />
                            <div className="my-4"></div>
                            <ProjectItem
                                title="Cd Burner App"
                                description="A Windows app in C++ for secure data burning on optical media."
                                link="https://github.com/dervisgenc/CdBurner"
                                isDarkMode={isDarkMode}
                            />
                            <div className="my-4"></div>
                            <ProjectItem
                                title="Fileless Malware Analysis with AI"
                                description="Bachelor's capstone project focused on detecting fileless malware using AI/ML techniques."
                                link="#"
                                isDarkMode={isDarkMode}
                                text="In Progress"
                            />
                            <div className="my-4"></div>
                            <ProjectItem
                                title="Personal Blog App"
                                description="A full-stack application for managing and sharing blog posts. Built with React, TypeScript, Go, and PostgreSQL."
                                link="https://dervisgenc.com"
                                isDarkMode={isDarkMode}
                            />

                        </CVSection>

                        <CVSection title="Education & Certificates" isDarkMode={isDarkMode}>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-semibold">Computer Engineering</h4>
                                    <p className="text-gray-400">Istanbul Technical University (2020 - 2025)</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Certificates:</h4>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        <li>CCNAv7: Introduction to Networks Course</li>
                                    </ul>
                                </div>
                            </div>
                        </CVSection>
                    </div>
                </div>
            </section>
        </div>
    );
}


interface ContactItemProps {
    icon: React.ReactNode;
    text: string;
    href?: string;
    isDarkMode: boolean;
}

const ContactItem = ({ icon, text, href, isDarkMode }: ContactItemProps) => (
    <a
        href={href}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        className={`flex items-center gap-3 ${isDarkMode
            ? 'text-gray-100 hover:text-cyan-400'
            : 'text-gray-700 hover:text-cyan-600'
            } transition-colors`}
    >
        {icon}
        <span>{text}</span>
    </a>
)

interface SkillBadgeProps {
    children: React.ReactNode;
    isDarkMode: boolean;
}

const SkillBadge = ({ children, isDarkMode }: SkillBadgeProps) => (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode
        ? 'bg-gray-700 text-gray-100'
        : 'bg-gray-200 text-gray-800'
        }`}>
        {children}
    </span>
)

interface CVSectionProps {
    title: string;
    children: React.ReactNode;
    isDarkMode: boolean;
}

const CVSection = ({ title, children }: CVSectionProps) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-cyan-400">{title}</h3>
        {children}
    </div>
)

interface ProjectItemProps {
    title: string;
    description: string;
    link: string;
    isDarkMode: boolean;
    text?: string;
}

const ProjectItem = ({ title, description, link, isDarkMode, text }: ProjectItemProps) => (
    <div className={`${isDarkMode
        ? 'bg-gray-800 hover:bg-gray-750'
        : 'bg-white hover:bg-gray-100'
        } p-6 rounded-lg transition-colors`}>
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-4`}>{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            {text || "View on GitHub"}
        </a>
    </div>
)

interface ExperienceItemProps {
    title: string;
    company: string;
    period: string;
    description: string;
    isDarkMode: boolean;
}

const ExperienceItem = ({ title, company, period, description, isDarkMode }: ExperienceItemProps) => (
    <div className="relative">
        <div className="absolute -left-11 mt-1.5 h-4 w-4 rounded-full border-2 border-gray-700 bg-gray-900"></div>
        <h4 className="text-xl font-semibold">{title}</h4>
        <p className="text-gray-400">{company} | {period}</p>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } mt-2`}>{description}</p>
    </div>
)