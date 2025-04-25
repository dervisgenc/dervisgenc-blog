import Image from "next/image";
import Link from "next/link";
import { GitHubLogoIcon, InstagramLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Linkedin, Mail, MapPin, Globe, BookOpen } from "lucide-react";

import { SkillBadge } from "@/components/SkillBadge";
import { CVSection } from "@/components/CVSection";
import { ProjectItem } from "@/components/ProjectItem";
import { ExperienceItem } from "@/components/ExperienceItem";

export const metadata = {
  // Başlıkta her iki ismi ve sayfanın amacını belirt
  title: "Derviş Genç",
  // Açıklamada yine her iki ismi ve sayfadaki anahtar bilgileri kullan
  description: "Personal bio, projects, skills, and work experience of Dervis Genc (Derviş Genç), a Computer Engineering student at  Istanbul Technical University. Specializing in Cybersecurity, Go, C++, Linux.",
  // Bu sayfa için alternatif canonical URL (genelde kendisi olur)
  alternates: {
    canonical: 'https://dervisgenc.com', // Kendi domain'ini ve bu sayfanın yolunu yaz
  },

};

function addPersonJsonLd() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Derviş Genç",
    "alternateName": "Dervis Genc", // Alternatif isim
    "url": "https://dervisgenc.com", // Ana sayfa URL'si
    "image": "https://dervisgenc.com/portre.jpg", // Profil resmi URL'si
    "sameAs": [ // Sosyal medya ve diğer profiller
      "https://github.com/dervisgenc",
      "https://www.linkedin.com/in/dervisgenc/",
      "https://www.instagram.com/dervis_genc/",
      "https://x.com/1sabredendervis"
    ],
    "jobTitle": "Computer Engineering Student",
    "worksFor": {
      "@type": "Organization",
      "name": "Istanbul Technical University"
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Istanbul Technical University"
    },
    "nationality": "Turkish",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Istanbul",
      "addressCountry": "TR"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  );
}

// *Bu bileşen sunucu-taraflı render edilebilir; “use client” gerekmiyor.*
export default function AboutPage() {
  return (
    <div className="dark bg-skin-fill text-skin-base min-h-screen">
      {/* Add the JSON-LD script to the page */}
      {addPersonJsonLd()}

      {/* HERO ------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-16 md:py-24 min-h-screen flex items-center">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="bg-skin-card rounded-xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12 items-center">
              {/* Profil -------------------------------------------------- */}
              {/* Remove md:items-start to keep items centered */}
              <div className="md:col-span-1 flex flex-col items-center">
                {/* Added self-center to ensure horizontal centering within the flex column */}
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-cyan-400 mb-6 ">
                  <Image
                    src="/portre.png"
                    alt="Derviş Genç"
                    width={192} // Match md:w-48 (pixels)
                    height={192} // Match md:h-48 (pixels)
                    className="object-cover w-full h-full" // Ensure image fills the container
                  />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-gradient-text bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 bg-clip-text text-transparent text-center md:text-left">
                  Derviş Genç
                </h1>
                <p className="text-lg text-skin-muted text-center md:text-left">Computer Engineering Student</p>
              </div>

              {/* Tanıtım + Yetenekler ---------------------------------- */}
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

                {/* İletişim kartları ---------------------------------- */}
                <div className="pt-4 border-t border-border">
                  <h2 className="text-xl font-semibold mb-4 text-cyan-400">Connect with Me</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mail */}
                    <a
                      href="mailto:0dervisgenc@gmail.com"
                      className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border hover:border-skin-accent hover:bg-skin-card-hover hover:scale-[1.02] transition-all"
                    >
                      <Mail className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">0dervisgenc@gmail.com</span>
                    </a>

                    {/* Blog – dahili değil, farklı sub-domain → <a> */}
                    <a
                      href="https://blog.dervisgenc.com"
                      className="flex items-center gap-3 p-3 bg-cyan-900/30 border border-cyan-700 rounded-lg hover:bg-cyan-800/50 hover:border-cyan-600 hover:scale-[1.02] transition-all"
                    >
                      <BookOpen className="h-5 w-5 text-cyan-400" />
                      <span className="text-cyan-300 font-medium">My Blog</span>
                    </a>

                    {/* GitHub */}
                    <a
                      href="https://github.com/dervisgenc"
                      className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border hover:border-skin-accent hover:bg-skin-card-hover hover:scale-[1.02] transition-all"
                    >
                      <GitHubLogoIcon className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">github.com/dervisgenc</span>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href="https://www.linkedin.com/in/dervisgenc/"
                      className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border hover:border-blue-500 hover:bg-skin-card-hover hover:scale-[1.02] transition-all"
                    >
                      <Linkedin className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">linkedin.com/in/dervisgenc</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/dervis_genc/"
                      className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border hover:border-pink-500 hover:bg-skin-card-hover hover:scale-[1.02] transition-all"
                    >
                      <InstagramLogoIcon className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">Instagram</span>
                    </a>

                    {/* X / Twitter */}
                    <a
                      href="https://x.com/1sabredendervis"
                      className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border hover:border-sky-500 hover:bg-skin-card-hover hover:scale-[1.02] transition-all"
                    >
                      <TwitterLogoIcon className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">Twitter / X</span>
                    </a>

                    {/* Kişisel site */}
                    <Link
                      href="https://dervisgenc.com"
                      className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border hover:border-green-500 hover:bg-skin-card-hover hover:scale-[1.02] transition-all"
                    >
                      <Globe className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">dervisgenc.com</span>
                    </Link>

                    {/* Lokasyon */}
                    <div className="flex items-center gap-3 p-3 bg-skin-card-muted rounded-lg border">
                      <MapPin className="h-5 w-5 text-skin-icon" />
                      <span className="text-skin-base">Istanbul, Turkey</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE & SKILLS --------------------------------------------- */}
      <section className="py-16 bg-skin-fill min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Experience & Skills
          </h2>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Work Experience */}
            <CVSection title="Work Experience">
              <div className="space-y-8 relative pl-11 border-l-2 border-border">
                <ExperienceItem
                  title="Cybersecurity Part-Time Working Student"
                  company="Siemens Advanta"
                  period="Jan 2024 – Present"
                  description="Contributed to risk and vulnerability management, incident management, and developed security policies in Information Security. Gained hands-on experience in SDL processes."
                />
                <ExperienceItem
                  title="Freelance Web Developer"
                  company="Vision Base"
                  period="Oct 2024 – Nov 2024"
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
                  description="Bachelor's capstone project focused on detecting fileless malware using ML techniques."
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

            {/* EDUCATION & CERTIFICATES (tam genişlik) */}
            <div className="md:col-span-2">
              <CVSection title="Education & Certificates">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold">Computer Engineering</h4>
                    <p className="text-skin-muted">Istanbul Technical University (2020 – 2025)</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Certificates:</h4>
                    <ul className="list-disc list-inside text-skin-base space-y-1">
                      <li>CCNAv7: Introduction to Networks</li>
                      <li>UPM168: Robotics Applications with ROS2 (Mar 2025)</li>
                    </ul>
                  </div>
                </div>
              </CVSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
