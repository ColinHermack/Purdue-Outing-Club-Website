import Link from "next/link";

import fs from "fs";
import path from "path";

type Metadata = {
  title: string;
  postedOn: string;
  summary: string;
  author: string;
  image?: string;
  github?: string;
  deployment?: string;
};

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, "").trim();
  let frontMatterLines = frontMatterBlock.trim().split("\n");
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();

    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    metadata[key.trim() as keyof Metadata] = value;
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");

  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir);

  let postsData = mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });

  postsData.sort((a, b) => {
    return (
      new Date(b.metadata.postedOn).getTime() -
      new Date(a.metadata.postedOn).getTime()
    );
  });

  return postsData;
}

export function getPosts() {
  return getMDXData(path.join(process.cwd(), "newsposts"));
}

export function NewsArticles() {
  let posts = getPosts();

  return (
    <div className="mt-10 text-left">
      {posts
        .sort((a, b) => {
          if (new Date(a.metadata.postedOn) > new Date(b.metadata.postedOn)) {
            return -1;
          }

          return 1;
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
              <p className="max-w-[95%]">{post.metadata.summary}</p>
            </div>
          </Link>
        ))}
    </div>
  );
}

interface IRecentProjectProps {
  numPosts: number;
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

          return 1;
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
              <p className="max-w-[95%]">{project.metadata.summary}</p>
            </div>
          </Link>
        ))}
    </div>
  );
}
