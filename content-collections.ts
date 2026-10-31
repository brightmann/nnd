import type { CollectionContext, Meta } from '@content-collections/core'

import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { x } from 'tinyexec'
import * as z from 'zod'

import { getTOC, rehypePlugins, remarkPlugins } from '@/mdx-plugins'

type BaseDoc = {
  _meta: Meta
  content: string
  date?: string | Date
}

async function transform<TDoc extends BaseDoc>(document: TDoc, context: CollectionContext) {
  const code = await compileMDX(context, document, {
    remarkPlugins,
    rehypePlugins,
  })
  const [locale, path] = document._meta.path.split(/[/\\]/)

  if (!locale || !path) {
    throw new Error(`Invalid path: ${document._meta.path}`)
  }

  // `CollectionContext` exposes `collection` to collection transforms, but its intersection with
  // the deprecated base `Context.collection` incorrectly preserves the deprecation marker.
  // oxlint-disable-next-line no-deprecated
  const { directory, name: collectionName } = context.collection
  const fullPath = `${directory}/${document._meta.filePath}`

  const lastModified = await context.cache(fullPath, async () => {
    const { stdout } = await x('git', ['log', '-1', `--format=%ai`, '--', fullPath])
    if (stdout) {
      return new Date(stdout.trim()).toISOString()
    }
    return new Date().toISOString()
  })

  const gitDate = await context.cache(`${fullPath}:date`, async () => {
    const { stdout } = await x('git', ['log', '--diff-filter=A', '--follow', `--format=%ai`, '--', fullPath])
    if (stdout) {
      return new Date(stdout.trim()).toISOString()
    }
    return new Date().toISOString()
  })

  // A frontmatter date wins over the git date: the build's git history is
  // shallow, so `git log` attributes every file to the same HEAD commit and
  // all posts tie. Without an explicit date, posts fall back to that order.
  const rawDate = document.date
  let frontmatterTime = Number.NaN
  if (rawDate instanceof Date) {
    frontmatterTime = rawDate.getTime()
  } else if (rawDate) {
    frontmatterTime = new Date(rawDate).getTime()
  }
  const date = Number.isNaN(frontmatterTime) ? gitDate : new Date(frontmatterTime).toISOString()

  const opengraphSegments = [collectionName, path, 'image.png']

  return {
    ...document,
    code,
    locale,
    slug: path,
    date,
    lastModified,
    toc: await getTOC(document.content),
    opengraphImage: {
      segments: opengraphSegments,
      url: `/og/${opengraphSegments.join('/')}`,
    },
  }
}

const posts = defineCollection({
  name: 'posts',
  directory: 'src/content/blog',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.union([z.string(), z.date()]).optional(),
    content: z.string(),
  }),
  transform,
})

const projects = defineCollection({
  name: 'projects',
  directory: 'src/content/projects',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    homepage: z.string().optional(),
    github: z.string(),
    techstack: z.array(z.string()),
    selected: z.boolean().optional().default(false),
    dateCreated: z.string(),
    content: z.string(),
  }),
  transform,
})

const sites = defineCollection({
  name: 'sites',
  directory: 'src/content/pages',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
  }),
  transform,
})

export default defineConfig({
  content: [posts, projects, sites],
})
