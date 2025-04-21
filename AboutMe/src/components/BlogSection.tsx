import { BookOpen } from "lucide-react"

interface BlogSectionProps {
}

export const BlogSection = ({ }: BlogSectionProps) => (
    // Use theme background color, maybe a muted variant
    <section className="py-16 bg-skin-fill">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-skin-fill-muted rounded-xl shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:shrink-0 flex items-center justify-center p-6 bg-gradient-to-r from-cyan-600 to-blue-600 md:rounded-l-xl md:rounded-r-none rounded-t-xl">
                        <BookOpen className="h-24 w-24 text-white" />
                    </div>
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                            My Writings and Thoughts
                        </div>
                        <h2 className="mt-2 text-2xl font-bold text-skin-base"> {/* Use theme text color */}
                            Personal Blog Page
                        </h2>
                        <p className="mt-2 text-skin-muted"> {/* Use theme muted text color */}
                            Visit my blog page where I share my thoughts and experiences on technology, cybersecurity, software development, and more.
                        </p>
                        <div className="mt-4">
                            <a
                                href="https://blog.dervisgenc.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                            >
                                Visit Blog
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
)
