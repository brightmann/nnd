import type { Locale } from 'next-intl'

import { notFound } from 'next/navigation'

import { BlogPagination } from '@/components/blog/blog-pagination'
import { FilteredPosts } from '@/components/filtered-posts'
import { JsonLd } from '@/components/json-ld'
import { PageHeader } from '@/components/page-header'
import { getLatestPosts, getSite } from '@/lib/content'
import { createJsonLdCollectionPage } from '@/lib/json-ld'
import { getLocalizedPath } from '@/utils/get-localized-path'

export const POSTS_PER_PAGE = 6

type BlogListPageProps = {
  locale: Locale
  page: number
}

export function BlogListPage(props: BlogListPageProps) {
  const { locale, page } = props

  const site = getSite('blog', locale)

  if (!site) notFound()

  const { title, description } = site

  const allPosts = getLatestPosts(locale)
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE))

  if (page < 1 || page > totalPages) notFound()

  const posts = allPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const blogUrl = getLocalizedPath('/blog', locale)
  const pageUrl = page === 1 ? blogUrl : getLocalizedPath(`/blog/page/${page}`, locale)

  const jsonLd = createJsonLdCollectionPage({
    id: pageUrl,
    title,
    description,
    url: pageUrl,
    locale,
    items: posts.map((post, index) => ({
      '@type': 'BlogPosting' as const,
      headline: post.title,
      url: `${blogUrl}/${post.slug}`,
      datePublished: post.date,
      dateModified: post.lastModified,
      position: (page - 1) * POSTS_PER_PAGE + index + 1,
    })),
  })

  return (
    <>
      <JsonLd json={jsonLd} />
      <PageHeader title={title} description={description} />
      <FilteredPosts posts={posts} />
      <BlogPagination currentPage={page} totalPages={totalPages} />
    </>
  )
}
