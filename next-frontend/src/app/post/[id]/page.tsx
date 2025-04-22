import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock } from "lucide-react"
import PostLikeButton from "@/components/post-like-button"
import PostShareButton from "@/components/post-share-button"
import RelatedPosts from "@/components/related-posts"
import { CalendarIcon, ArrowLeftIcon } from "@radix-ui/react-icons"

type PostType = {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
};

// Mock data for a single post
const posts: { [key: string]: PostType } = {
  "1": {
    id: "1",
    title: "Understanding Zero-Day Exploits: The Silent Threats",
    content: `
      <p>Zero-day vulnerabilities represent one of the most dangerous threats in cybersecurity. These are flaws in software or hardware that are unknown to those who should be interested in mitigating the vulnerability (including the vendor of the target software).</p>
      
      <p>The term "zero-day" refers to the fact that developers have had zero days to address and patch the vulnerability. Once the vulnerability becomes known, developers have literally "zero days" to fix it before hackers can exploit it.</p>
      
      <h2>Why Zero-Day Exploits Are Dangerous</h2>
      
      <p>Zero-day exploits are particularly dangerous for several reasons:</p>
      
      <ul>
        <li>They are unknown to the software vendor, meaning there are no patches or fixes available.</li>
        <li>Traditional security measures like antivirus software may not detect them since they're previously unknown threats.</li>
        <li>They can remain undetected for months or even years, allowing attackers prolonged access to compromised systems.</li>
        <li>They are highly valued in underground markets, with prices ranging from thousands to millions of dollars.</li>
      </ul>
      
      <h2>Notable Zero-Day Attacks</h2>
      
      <p>Several high-profile cyber attacks have leveraged zero-day vulnerabilities:</p>
      
      <ul>
        <li><strong>Stuxnet</strong>: This sophisticated computer worm used multiple zero-day exploits to target Iranian nuclear facilities.</li>
        <li><strong>Sony Pictures Hack</strong>: Attackers used zero-day vulnerabilities to breach Sony's network, stealing confidential data and causing extensive damage.</li>
        <li><strong>Equifax Breach</strong>: Attackers exploited a zero-day vulnerability in Apache Struts, compromising sensitive data of 147 million people.</li>
      </ul>
      
      <h2>Protecting Against Zero-Day Exploits</h2>
      
      <p>While it's challenging to defend against unknown threats, organizations can take several measures to minimize risk:</p>
      
      <ol>
        <li><strong>Implement defense-in-depth strategies</strong>: Use multiple layers of security to create redundancy.</li>
        <li><strong>Keep systems updated</strong>: While this won't protect against zero-days initially, it reduces the attack surface.</li>
        <li><strong>Use behavior-based detection</strong>: Modern security solutions can detect suspicious behavior even if the specific threat is unknown.</li>
        <li><strong>Employ the principle of least privilege</strong>: Limit user permissions to reduce the potential impact of an exploit.</li>
        <li><strong>Regularly back up critical data</strong>: Ensure you can recover if a zero-day attack succeeds.</li>
      </ol>
      
      <h2>The Future of Zero-Day Vulnerabilities</h2>
      
      <p>As software becomes more complex and interconnected, the potential for zero-day vulnerabilities increases. However, advancements in artificial intelligence and machine learning are improving our ability to detect unusual patterns that might indicate a zero-day exploit.</p>
      
      <p>Bug bounty programs, where companies pay security researchers to find and report vulnerabilities, have also become an important tool in discovering potential zero-days before malicious actors can exploit them.</p>
      
      <p>The battle against zero-day exploits represents the cutting edge of cybersecurity—a constant race between attackers seeking to discover and exploit unknown vulnerabilities and defenders working to identify and patch them before they can be used maliciously.</p>
    `,
    coverImage: "/placeholder.svg?height=600&width=1200",
    date: "22 Apr 2025",
    readTime: "5 min read",
    category: "Cybersecurity",
    tags: ["security", "vulnerabilities", "hacking", "defense"],
    likes: 142,
    comments: 38,
  },
}

// This would be replaced with a database query in a real application
async function getPost(id: string) {
  // Simulate a database lookup
  return posts[id] || null
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

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

      <article className="mx-auto max-w-3xl">
        <div className="mb-6 space-y-4">
          <Badge className="bg-cyan-600 hover:bg-cyan-700">{post.category}</Badge>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
          <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="mb-6 flex items-center justify-between border-y border-border py-4">
          <PostLikeButton postId={post.id} initialLikes={post.likes} />
          <PostShareButton postId={post.id} title={post.title} />
        </div>

        <Separator className="my-6" />

        <RelatedPosts currentPostId={post.id} />
      </article>
    </div>
  )
}
