/**
 * Reads news posts from newsposts/*.mdx for GET /api/news/recent. app/news/postUtils.tsx has a similar reader that
 * also renders the news lists; keep the frontmatter parsing in both in step.
 *
 * @author Colin Hermack
 */

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

/**
 * Splits a post into its frontmatter and body. The parser is deliberately simple: one `key: value` per line between
 * the first pair of `---` lines, with surrounding quotes removed. It throws if a post has no frontmatter.
 */
function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  const frontMatterBlock = match![1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
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
  const rawContent = fs.readFileSync(filePath, "utf-8");

  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);

  const postsData = mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

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

/** Returns every post in newsposts/, newest first by `postedOn`. Reads the file system on each call. */
export function getPosts() {
  return getMDXData(path.join(process.cwd(), "newsposts"));
}
