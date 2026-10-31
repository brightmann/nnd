'use client'

import type { Post } from 'content-collections'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { PostCard } from './post-card'
import { Button } from './ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'

const PAGE_SIZE = 6

type FilteredPostsProps = {
  posts: Post[]
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

export function FilteredPosts(props: FilteredPostsProps) {
  const { posts } = props
  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const t = useTranslations()

  const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(searchValue.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pagePosts = filteredPosts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <InputGroup className='mb-8'>
        <InputGroupInput
          type='text'
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setCurrentPage(1)
          }}
          placeholder={t('components.filtered-posts.placeholder')}
          aria-label={t('components.filtered-posts.placeholder')}
          className='w-full pl-12'
          id='search'
        />
        <InputGroupAddon>
          <SearchIcon className='text-muted-foreground' />
        </InputGroupAddon>
      </InputGroup>
      {filteredPosts.length === 0 && (
        <div className='my-24 text-center text-xl'>{t('components.filtered-posts.no-posts-found')}</div>
      )}
      <div className='grid gap-4 md:grid-cols-2'>
        {pagePosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      {totalPages > 1 && (
        <nav aria-label={t('components.blog-pagination.label')} className='mt-8 flex items-center justify-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            disabled={safePage === 1}
            onClick={() => {
              setCurrentPage(safePage - 1)
            }}
          >
            {t('components.blog-pagination.previous')}
          </Button>
          {getPageItems(safePage, totalPages).map((item) => {
            const { key, value } = item

            if (value === 'ellipsis') {
              return (
                <span key={key} className='px-1 text-muted-foreground'>
                  …
                </span>
              )
            }

            return (
              <Button
                key={key}
                variant={value === safePage ? 'default' : 'ghost'}
                size='sm'
                aria-current={value === safePage ? 'page' : undefined}
                onClick={() => {
                  setCurrentPage(value)
                }}
              >
                {value}
              </Button>
            )
          })}
          <Button
            variant='ghost'
            size='sm'
            disabled={safePage === totalPages}
            onClick={() => {
              setCurrentPage(safePage + 1)
            }}
          >
            {t('components.blog-pagination.next')}
          </Button>
        </nav>
      )}
    </>
  )
}
