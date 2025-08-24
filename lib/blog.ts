import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = join(process.cwd(), 'posts')

export interface BlogPost {
  slug: string
  title: string
  date: string
  author?: string
  excerpt: string
  content: string
  category?: string
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const processedContent = await remark().use(html).process(content)
    const contentHtml = processedContent.toString()

    return {
      slug,
      title: data.title || '',
      date: data.date || new Date().toISOString(),
      author: data.author,
      excerpt: data.excerpt || content.slice(0, 150) + '...',
      content: contentHtml,
      category: data.category,
    }
  } catch (error) {
    return null
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // Create posts directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true })
    }

    const slugs = fs.readdirSync(postsDirectory)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''))
    
    const posts = await Promise.all(
      slugs.map(async (slug) => await getPostBySlug(slug))
    )
    
    // Filter out null posts and sort by date
    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    return []
  }
}