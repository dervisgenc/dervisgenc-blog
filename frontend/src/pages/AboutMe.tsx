import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button"
import { Linkedin, Mail, Phone, MapPin, Download, Globe, Github } from 'lucide-react'

export default function AboutMe() {
    return (
        <div className="bg-gray-900 text-gray-100">
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900  min-h-screen">
                <Header isDarkMode={true} toggleDarkMode={function (): void {

                }}>

                </Header>

                <div className="flex items-center min-h-[calc(100vh-100px)] justify-center p-4">
                    <div className="container max-w-6xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-8 p-8">
                            <div className="space-y-6">
                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-cyan-400 mx-auto md:mx-0">
                                    <img src="/placeholder.svg?height=200&width=200" alt="Derviş Genç" className="w-full h-full object-cover" />
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent text-center md:text-left">
                                    Derviş Genç
                                </h1>
                                <p className="text-xl md:text-2xl leading-relaxed mb-6 text-gray-100">
                                    Aspiring Computer Engineer with a passion for cybersecurity and software development. Currently honing my skills at Istanbul Technical University, I'm on a mission to push the boundaries of technology and secure the digital frontier.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    {['C/C++', 'C#', 'Python', 'Java', 'Linux', 'Network Security'].map((skill) => (
                                        <SkillBadge key={skill}>{skill}</SkillBadge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="bg-gray-700 bg-opacity-50 p-6 rounded-lg">
                                    <h2 className="text-2xl font-bold mb-4 text-cyan-400">Connect with Me</h2>
                                    <div className="space-y-4">
                                        <ContactItem icon={<Mail className="text-purple-400" />} text="0dervisgenc@gmail.com" href="mailto:0dervisgenc@gmail.com" />
                                        <ContactItem icon={<Phone className="text-green-400" />} text="+905527940713" href="tel:+905527940713" />
                                        <ContactItem icon={<MapPin className="text-red-400" />} text="Sariyer/Istanbul Turkey" href={undefined} />
                                        <ContactItem icon={<Github className="text-gray-400" />} text="github.com/dervisgenc" href="https://github.com/dervisgenc" />
                                        <ContactItem icon={<Linkedin className="text-blue-400" />} text="linkedin.com/in/dervisgenc" href="https://www.linkedin.com/in/dervisgenc/" />
                                        <ContactItem icon={<Globe className="text-cyan-400" />} text="dervisgenc.com" href="https://www.dervisgenc.com" />
                                    </div>
                                </div>
                                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white group transition-all duration-300 ease-in-out transform hover:scale-105">
                                    <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                                    Download Full Resume
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower section: CV Details */}
            <section className="min-h-screen bg-gray-900 py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        Experience & Skills
                    </h2>

                    <div className="space-y-16">
                        <CVSection title="Technical Skills">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['C/C++', 'C#', 'Python', 'Java', 'Linux', 'Network Security', 'Web Development', 'Git'].map((skill) => (
                                    <div key={skill} className="bg-gray-800 p-3 rounded-lg text-center hover:bg-gray-700 transition-colors">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </CVSection>

                        <CVSection title="Projects">
                            <div className="space-y-6">
                                <ProjectItem
                                    title="Human Resources Management System Backend (Java)"
                                    description="Developed a comprehensive HR management system using Java, implementing core functionalities for employee data management and payroll processing."
                                    link="https://github.com/dervisgenc/javaCamp/tree/main/hrms"
                                />
                                <ProjectItem
                                    title="Rent a Car Backend (C#)"
                                    description="Created a robust backend system for a car rental service using C# and .NET, handling reservations, inventory management, and user authentication."
                                    link="https://github.com/dervisgenc/rent-a-car-project"
                                />
                            </div>
                        </CVSection>

                        <CVSection title="Work Experience">
                            <div className="relative border-l-2 border-gray-700 pl-8 ml-4 space-y-8">
                                <ExperienceItem
                                    title="Software Developer Intern"
                                    company="TechCorp Inc."
                                    period="June 2023 - August 2023"
                                    description="Assisted in developing web applications, collaborated with senior developers, and gained hands-on experience with agile methodologies."
                                />
                            </div>
                        </CVSection>

                        <CVSection title="Education & Certificates">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-semibold">Computer Engineering</h4>
                                    <p className="text-gray-400">Istanbul Technical University (2020 - 2025 expected)</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold mb-2">Certificates:</h4>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        <li>CCNAv7: Introduction to Networks Course</li>
                                        <li>Partner: NDG Linux Unhatched Course</li>
                                        <li>Introduction to Cybersecurity Course</li>
                                    </ul>
                                </div>
                            </div>
                        </CVSection>
                    </div>
                </div>
            </section>

            <Footer></Footer>
        </div>
    )
}

interface ContactItemProps {
    icon: React.ReactNode;
    text: string;
    href?: string;
}

const ContactItem = ({ icon, text, href }: ContactItemProps) => (
    <a
        href={href}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener noreferrer" : undefined}
        className="flex items-center gap-3 hover:text-cyan-400 transition-colors text-gray-100"
    >
        {icon}
        <span>{text}</span>
    </a>
)

interface SkillBadgeProps {
    children: React.ReactNode;
}

const SkillBadge = ({ children }: SkillBadgeProps) => (
    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-gray-100">
        {children}
    </span>
)

interface CVSectionProps {
    title: string;
    children: React.ReactNode;
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
}

const ProjectItem = ({ title, description, link }: ProjectItemProps) => (
    <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors">
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-gray-300 mb-4">{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            View on GitHub
        </a>
    </div>
)

interface ExperienceItemProps {
    title: string;
    company: string;
    period: string;
    description: string;
}

const ExperienceItem = ({ title, company, period, description }: ExperienceItemProps) => (
    <div className="relative">
        <div className="absolute -left-11 mt-1.5 h-4 w-4 rounded-full border-2 border-gray-700 bg-gray-900"></div>
        <h4 className="text-xl font-semibold">{title}</h4>
        <p className="text-gray-400">{company} | {period}</p>
        <p className="mt-2 text-gray-300">{description}</p>
    </div>
)