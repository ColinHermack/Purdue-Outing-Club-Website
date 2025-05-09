import { notFound } from "next/navigation";
import { remark } from "remark";
import html from "remark-html";

import { getPosts } from "@/app/news/utils";
import { BASE_URL } from "@/config/constants";

export async function generateStaticParams() {
  let posts = getPosts();

  return posts.map((curr) => ({
    slug: curr.slug,
  }));
}

export function generateMetadata({ params }: any) {
  let post = getPosts().find((post) => post.slug === params.slug);

  if (!post) {
    return;
  }

  let {
    title,
    postedOn: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? image
    : `${BASE_URL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${BASE_URL}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
  };
}

export default async function NewsPost({ params }: any) {
  let post = getPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const processedContent = await remark().use(html).process(post.content);

  const contentHtml = processedContent.toString();

  return (
    <section>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.postedOn,
            dateModified: post.metadata.postedOn,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${BASE_URL}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${BASE_URL}/blog/${post.slug}`,
          }),
        }}
        suppressHydrationWarning
        type="application/ld+json"
      />
      <h1 className="text-5xl text-amber-400 font-bold text-left">
        {post.metadata.title}
      </h1>
      <p className="mt-2 text-left font-bold text-neutral-400 text-xs">
        {post.metadata.postedOn}
      </p>
      <p className="mt-2 text-left font-bold text-neutral-400 text-xs">
        Written by {post.metadata.author}
      </p>
      <p className="my-8 text-left">{post.metadata.summary}</p>
      <article
        dangerouslySetInnerHTML={{ __html: contentHtml }}
        className="prose dark:prose-invert prose-a:text-amber-400 prose-a:no-underline text-left [&>p]:my-4 [&>ul]:list-disc [&>ul]:ml-8 [&>h2]:font-bold [&>h2]:text-xl [&>h2]:my-4 [&>p>a]:text-amber-400"
      />
    </section>
  );
}
