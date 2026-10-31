import { getTranslations } from 'next-intl/server'

import { Link } from '@/components/ui/link'

type BlogPaginationProps = {
  currentPage: number
  totalPages: number
}

type PageItem = {
  key: string
  value: number | 'ellipsis'
}

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({ key: `page-${index + 1}`, value: index + 1 }))
  }

  const pages = [...new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])]
    .filter((page) => page >= 1 && page <= totalPages)
    .toSorted((a, b) => a - b)

  const items: PageItem[] = []
  let previous = 0

  for (const page of pages) {
    if (page - previous > 1) items.push({ key: `ellipsis-before-${page}`, value: 'ellipsis' })
    items.push({ key: `page-${page}`, value: page })
    previous = page
  }

  return items
}

function pageHref(page: number): `/${string}` {
  return page === 1 ? '/blog' : `/blog/page/${page}`
}

export async function BlogPagination(props: BlogPaginationProps) {
  const { currentPage, totalPages } = props

  if (totalPages <= 1) return null

  const t = await getTranslations('components.blog-pagination')

  const linkClassName =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground'
  const currentClassName =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground'
  const disabledClassName =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-3 text-sm font-medium opacity-50'

  return (
    <nav aria-label={t('label')} className='mt-8 flex items-center justify-center gap-1'>
      {currentPage > 1 ? (
        <Link href={pageHref(currentPage - 1)} className={linkClassName}>
          {t('previous')}
        </Link>
      ) : (
        <span aria-disabled='true' className={disabledClassName}>
          {t('previous')}
        </span>
      )}
      {getPageItems(currentPage, totalPages).map((item) => {
        const { key, value } = item

        if (value === 'ellipsis') {
          return (
            <span key={key} className='px-1 text-muted-foreground'>
              …
            </span>
          )
        }

        if (value === currentPage) {
          return (
            <Link key={key} href={pageHref(value)} aria-current='page' className={currentClassName}>
              {value}
            </Link>
          )
        }

        return (
          <Link key={key} href={pageHref(value)} className={linkClassName}>
            {value}
          </Link>
        )
      })}
      {currentPage < totalPages ? (
        <Link href={pageHref(currentPage + 1)} className={linkClassName}>
          {t('next')}
        </Link>
      ) : (
        <span aria-disabled='true' className={disabledClassName}>
          {t('next')}
        </span>
      )}
    </nav>
  )
}
