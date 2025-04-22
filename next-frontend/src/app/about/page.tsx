import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

export default function AboutPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">About CyberTron</h1>

        <div className="mb-8 aspect-video relative rounded-lg overflow-hidden">
          <Image src="/placeholder.svg?height=600&width=1200" alt="CyberTron Blog" fill className="object-cover" />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            Welcome to CyberTron, a blog dedicated to exploring the fascinating worlds of cybersecurity, technology, and
            computer science. Our mission is to provide insightful, accessible content that helps readers understand
            complex technical concepts and stay informed about the latest developments in the digital landscape.
          </p>

          <h2>Our Mission</h2>
          <p>
            At CyberTron, we believe that knowledge about cybersecurity and technology should be accessible to everyone.
            Whether you're a seasoned professional or just beginning your journey in tech, our content aims to be
            informative, engaging, and practical.
          </p>

          <h2>What We Cover</h2>
          <p>Our content focuses on several key areas:</p>
          <ul>
            <li>
              <strong>Cybersecurity</strong> - From zero-day exploits to best practices for personal security
            </li>
            <li>
              <strong>Programming</strong> - Tutorials, best practices, and insights into various programming languages
              and paradigms
            </li>
            <li>
              <strong>Artificial Intelligence</strong> - Exploring the capabilities, limitations, and ethical
              considerations of AI
            </li>
            <li>
              <strong>Privacy</strong> - Discussing tools, techniques, and policies related to digital privacy
            </li>
            <li>
              <strong>Emerging Technologies</strong> - Analyzing new technologies and their potential impact
            </li>
          </ul>

          <h2>Our Team</h2>
          <p>
            CyberTron is maintained by a team of passionate technology enthusiasts with backgrounds in software
            development, cybersecurity research, and technical writing. We're committed to providing accurate,
            well-researched content that helps our readers navigate the complex world of technology.
          </p>

          <h2>Connect With Us</h2>
          <p>
            We love hearing from our readers! Whether you have questions, suggestions for topics, or just want to say
            hello, don't hesitate to reach out through our social media channels or contact form.
          </p>

          <p>
            Thank you for being part of the CyberTron community. We're excited to continue exploring the fascinating
            world of technology with you.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
