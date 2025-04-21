"use client"

import { GitHubLogoIcon, InstagramLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"
import { Linkedin, Mail, MapPin, Globe, BookOpen } from "lucide-react"
import { ContactItem } from "@/components/ContactItem"
import { SkillBadge } from "@/components/SkillBadge"
import { CVSection } from "@/components/CVSection"
import { ProjectItem } from "@/components/ProjectItem"
import { ExperienceItem } from "@/components/ExperienceItem"
import "./App.css" // Changed to relative path

export default function AboutMe() {
  return (
    // Add dark class here to enforce dark mode
    <div className="dark bg-skin-fill text-skin-base min-h-screen">
      {/* Hero Section */}
      <section
        // Simplified background, adjust gradient or use solid color if preferred
        // Added min-h-screen to make the section height equal to the window height
        // Added flex items-center to vertically center the content within the section
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-16 md:py-24 min-h-screen flex items-center"
      >
        <div className="container max-w-6xl mx-auto px-4">
          {/* This card will now use the updated dark mode --card variable */}
          <div className="bg-skin-card rounded-xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12 items-center">
              {/* Profile Image and Basic Info */}
              <div className="md:col-span-1 flex flex-col items-center md:items-start">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-cyan-400 mb-6">
                  <img src="/portre.jpg" alt="Derviş Genç" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-gradient-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent text-center md:text-left">
                  Derviş Genç
                </h1>
                <p className="text-lg text-skin-muted text-center md:text-left">Computer Engineering Student</p>
              </div>

              {/* Introduction Text and Skills */}
              <div className="md:col-span-2 space-y-6">
                <p className="text-lg md:text-xl leading-relaxed text-skin-base">
                  Senior Computer Engineering student at Istanbul Technical University with expertise in C/C++ and Go,
                  and a growing interest in Python, React, and C#. Passionate about cybersecurity, software development,
                  and Linux systems, with a focus on network/web security and malware analysis.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["C/C++", "Go", "Python", "React", "Linux", "Cybersecurity", "ROS2"].map((skill) => (
                    <SkillBadge key={skill}>{skill}</SkillBadge>
                  ))}
                </div>
                {/* Contact Info moved here for better balance */}
                <div className="pt-4 border-t border-border">
                  <h2 className="text-xl font-semibold mb-4 text-cyan-400">Connect with Me</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Remove hardcoded text colors from icons */}
                    <ContactItem
                      icon={<Mail className="h-5 w-5" />}
                      text="0dervisgenc@gmail.com"
                      href="mailto:0dervisgenc@gmail.com"
                    />
                    {/* Blog link added to Connect with Me section */}
                    <ContactItem
                      icon={<BookOpen className="h-5 w-5" />}
                      text="My Blog"
                      href="https://blog.dervisgenc.com"
                      highlight={true}
                    />
                    <ContactItem icon={<MapPin className="h-5 w-5" />} text="Istanbul, Turkey" />
                    <ContactItem
                      icon={<GitHubLogoIcon className="h-5 w-5" />}
                      text="github.com/dervisgenc"
                      href="https://github.com/dervisgenc"
                    />
                    <ContactItem
                      icon={<Linkedin className="h-5 w-5" />}
                      text="linkedin.com/in/dervisgenc"
                      href="https://www.linkedin.com/in/dervisgenc/"
                    />
                    <ContactItem
                      icon={<InstagramLogoIcon className="h-5 w-5" />}
                      text="Instagram"
                      href="https://www.instagram.com/dervis_genc/"
                    />
                    <ContactItem
                      icon={<TwitterLogoIcon className="h-5 w-5" />}
                      text="Twitter / X"
                      href="https://x.com/1sabredendervis"
                    />
                    <ContactItem
                      icon={<Globe className="h-5 w-5" />}
                      text="dervisgenc.com"
                      href="https://dervisgenc.com"
                    />

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Skills Section */}
      {/* Added min-h-screen to make the section height at least the window height */}
      <section className="py-16 bg-skin-fill min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Experience & Skills
          </h2>

          {/* Use grid for better layout on larger screens */}
          <div className="grid md:grid-cols-2 gap-16">
            {/* Work Experience */}
            <CVSection title="Work Experience">
              <div className="space-y-8 relative pl-11 border-l-2 border-border">
                <ExperienceItem
                  title="Cybersecurity Part-Time Working Student"
                  company="Siemens Advanta"
                  period="Jan 2024 - Present"
                  description="Contributed to risk and vulnerability management, incident management, and developed security policies in Information Security. Gained hands-on experience in Secure Development Lifecycle (SDL) processes in Product and Solution Secuirty."
                />
                <ExperienceItem
                  title="Freelance Web Developer"
                  company="Vision Base"
                  period="Oct 2024 - Nov 2024"
                  description="Developed an interactive corporate website using React, featuring video integration and user-focused design."
                />
              </div>
            </CVSection>

            {/* Projects */}
            <CVSection title="Projects">
              <div className="space-y-6">
                <ProjectItem
                  title="BeeHub"
                  description="Cross-platform desktop app for ITU students, featuring a React/TypeScript UI and Go-based backend."
                  link="https://github.com/ITU-BeeHub"
                />
                <ProjectItem
                  title="Cd Burner App"
                  description="A Windows app in C++ for secure data burning on optical media."
                  link="https://github.com/dervisgenc/CdBurner"
                />
                <ProjectItem
                  title="Fileless Malware Analysis with AI"
                  description="Bachelor's capstone project focused on detecting fileless malware using AI/ML techniques."
                  link="#"
                  text="In Progress"
                />
                <ProjectItem
                  title="Personal Blog App"
                  description="A full-stack application for managing and sharing blog posts. Built with React, TypeScript, Go, and PostgreSQL."
                  link="https://dervisgenc.com"
                />
              </div>
            </CVSection>

            {/* Education & Certificates (Full Width on Medium Screens) */}
            <div className="md:col-span-2">
              <CVSection title="Education & Certificates">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold">Computer Engineering</h4>
                    <p className="text-skin-muted">Istanbul Technical University (2020 - 2025)</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Certificates:</h4>
                    <ul className="list-disc list-inside text-skin-base space-y-1">
                      <li>CCNAv7: Introduction to Networks Course</li>
                      <li>
                        UPM168: Robotics Applications with ROS2: From Basics to Integration - Universidad Politecnica de
                        Madrid (March 2025)
                      </li>
                    </ul>
                  </div>
                </div>
              </CVSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
