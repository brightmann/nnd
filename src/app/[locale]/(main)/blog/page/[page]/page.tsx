import type { Metadata } from 'next'

import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { BlogListPage, POSTS_PER_PAGE } from '@/components/blog/blog-list-page'
import { routing } from '@/i18n/routing'
import { getLatestPosts, getSite } from '@/lib/content'
import { createPageMetadata } from '@/lib/metadata'
import { getLocalizedPath } from '@/utils/get-localized-path'

export function generateStaticParams(): Array<{ page: string; locale: string }> {
  const params: Array<{ page: string; locale: string }> = []

  for (const locale of routing.locales) {
    const totalPages = Math.ceil(getLatestPosts(locale).length / POSTS_PER_PAGE)

    for (let page = 2; page <= totalPages; page++) {
      params.push({ page: String(page), locale })
    }
  }

  return params
}

export const dynamicParams = false

export async function generateMetadata(props: {
  params: Promise<{ locale: string; page: string }>
}): Promise<Metadata> {
  const { params } = props
  const { page: pageParam } = await params
  const locale = await getLocale()

  const site = getSite('blog', locale)

  if (!site) return {}

  return createPageMetadata({
    title: site.title,
    description: site.description,
    canonical: `/blog/page/${pageParam}`,
    openGraphImage: site.opengraphImage.url,
    locale,
  })
}

async function Page(props: { params: Promise<{ locale: string; page: string }> }) {
  const { params } = props
  const { page: pageParam } = await params
  const locale = await getLocale()

  const page = Number(pageParam)

  if (!Number.isInteger(page) || page < 1) notFound()

  if (page === 1) redirect(getLocalizedPath('/blog', locale))

  return <BlogListPage locale={locale} page={page} />
}

export default Page
