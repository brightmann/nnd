import type { Metadata } from 'next'

import { getLocale } from 'next-intl/server'

import { BlogListPage } from '@/components/blog/blog-list-page'
import { getSite } from '@/lib/content'
import { createPageMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()

  const page = getSite('blog', locale)

  if (!page) return {}

  return createPageMetadata({
    title: page.title,
    description: page.description,
    canonical: '/blog',
    openGraphImage: page.opengraphImage.url,
    locale,
  })
}

async function Page() {
  const locale = await getLocale()

  return <BlogListPage locale={locale} page={1} />
}

export default Page
