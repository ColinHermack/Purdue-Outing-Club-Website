import { notFound } from 'next/navigation'
import { CustomMDX } from '@/components/mdx'
import { getProjects } from '@/app/news/utils'
import { BASE_URL } from '@/app/constants'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa';
import { FaServer } from 'react-icons/fa';

export async function generateStaticParams() {
  let projects = getProjects()

  return projects.map((curr) => ({
    slug: curr.slug,
  }))
}

export function generateMetadata({ params }: any) {
  let post = getProjects().find((post) => post.slug === params.slug)
  if (!post) {
    return
  }

  let {
    title,
    completedOn: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${BASE_URL}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${BASE_URL}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default function Blog({ params }: any) {
  let post = getProjects().find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.completedOn,
            dateModified: post.metadata.completedOn,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${BASE_URL}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${BASE_URL}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Colin Hermack',
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className='mt-4 text-xl flex flex-row content-left items-center'>
        {post.metadata.github ? <div className='hover:text-neutral-600 mr-8 transition-all'><Link href={post.metadata.github}><FaGithub /></Link></div> : null}
        {post.metadata.deployment ? <div className='hover:text-neutral-600 transition-all'><Link href={post.metadata.deployment}><FaServer /></Link></div> : null}
      </div>
      <p className='mt-4 mb-4'>{post.metadata.summary}</p>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
