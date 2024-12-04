import Link from 'next/link'
import { getProjects } from './utils';

export function Projects() {
    let projects = getProjects();
    return (
        <div>
          {projects
            .sort((a, b) => {
                if (new Date(a.metadata.completedOn) > new Date(b.metadata.completedOn)) {
                  return -1;
                }
                return 1
                
              })
            .map((post) => (
              <Link
                key={post.slug}
                className="flex flex-col space-y-1 mb-4"
                href={`/projects/${post.slug}`}
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
  numProjects: number
}

export function RecentProjects(props: IRecentProjectProps) {
  let projects = getProjects();
    return (
        <div>
          {projects
            .sort((a, b) => {
                if (new Date(a.metadata.completedOn) > new Date(b.metadata.completedOn)) {
                  return -1;
                }
                return 1
                
              })
            .slice(0, props.numProjects)
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