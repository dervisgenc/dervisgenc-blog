import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container py-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                Cyber<span className="text-cyan-500">Tron</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exploring cybersecurity, technology, and computer science.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex space-x-3">
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>

            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CyberTron. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
