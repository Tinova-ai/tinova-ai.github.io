import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Technical Blog - Tinova.ai',
  description: 'Latest insights, tutorials, and updates from the Tinova.ai team on AI infrastructure, cloud services, and technology trends.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl">
            Technical Blog
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Latest insights, tutorials, and updates from our engineering team
          </p>
        </div>

        <div className="mt-12">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-500">
                We're working on creating great content for you. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-600">
                        <span className="hover:underline">{post.category || 'Technology'}</span>
                      </p>
                      <Link href={`/blog/${post.slug}`} className="block mt-2">
                        <p className="text-xl font-semibold text-gray-900 hover:text-gray-600">
                          {post.title}
                        </p>
                        <p className="mt-3 text-base text-gray-500 line-clamp-3">
                          {post.excerpt}
                        </p>
                      </Link>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {post.author ? post.author.charAt(0).toUpperCase() : 'T'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {post.author || 'Tinova.ai Team'}
                        </p>
                        <div className="flex space-x-1 text-sm text-gray-500">
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}