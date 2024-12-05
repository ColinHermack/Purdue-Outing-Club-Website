import Link from 'next/link'
import { getPosts } from './utils';

export function NewsArticles() {
    let posts = getPosts();
    return (
        <div className='mt-10 text-left'>
          {posts
            .sort((a, b) => {
                if (new Date(a.metadata.postedOn) > new Date(b.metadata.postedOn)) {
                  return -1;
                }
                return 1
                
              })
            .map((post) => (
              <Link
                key={post.slug}
                className="flex flex-col space-y-1 mb-4"
                href={`/news/${post.slug}`}
              >
                <div className="w-full flex flex-col rounded transition-all duration-300 pt-2 pb-2 hover:bg-neutral-300/25 hover:pl-2 hover:shadow dark:hover:bg-neutral-500/10">
                  <h2 className="font-semibold dark:text-neutral-100 tracking-tight">
                    {post.metadata.title}
                  </h2>
                  <p className='max-w-[95%]'>{post.metadata.summary}</p>
                </div>
              </Link>
            ))}
        </div>
      )
}

interface IRecentProjectProps {
  numPosts: number
}

export function RecentNews(props: IRecentProjectProps) {
  let projects = getPosts();
    return (
        <div>
          {projects
            .sort((a, b) => {
                if (new Date(a.metadata.postedOn) > new Date(b.metadata.postedOn)) {
                  return -1;
                }
                return 1
                
              })
            .slice(0, props.numPosts)
            .map((project) => (
              <Link
                key={project.slug}
                className="flex flex-col space-y-1 mb-1"
                href={`/projects/${project.slug}`}
              >
                <div className="w-full flex flex-col rounded transition-all duration-300 pt-2 pb-2 hover:bg-neutral-300/25 hover:pl-2 hover:shadow dark:hover:bg-neutral-500/10">
                  <h2 className="font-semibold dark:text-white tracking-tight">
                    {project.metadata.title}
                  </h2>
                  <p className='max-w-[95%]'>{project.metadata.summary}</p>
                </div>
              </Link>
            ))}
        </div>
      )
}