import {
  DEFAULT_BLOG_HANDLE,
  getBlog,
  getBlogPath,
} from '@/lib/blog/operations'
import { Hero } from '@/components/blog/hero'

// Static hero for every blog listing surface. It reads no runtime data — only
// cached getBlog() — so it renders in the prerendered shell. The search box
// posts to the dedicated blog search route.
export async function HeroSlot() {
  const blogPath = getBlogPath(DEFAULT_BLOG_HANDLE)
  const blogData = await getBlog(DEFAULT_BLOG_HANDLE)

  return (
    <Hero image={blogData?.heroImage} searchAction={`${blogPath}/search`} />
  )
}
