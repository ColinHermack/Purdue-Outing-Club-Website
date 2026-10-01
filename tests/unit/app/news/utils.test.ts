import fs from "fs";
import path from "path";

import { describe, expect, it } from "vitest";

import { getPosts } from "@/app/news/utils";

describe("getPosts", () => {
  const posts = getPosts();

  it("returns one post per .mdx file in newsposts/", () => {
    const files = fs
      .readdirSync(path.join(process.cwd(), "newsposts"))
      .filter((file) => file.endsWith(".mdx"));

    expect(posts.map((post) => `${post.slug}.mdx`).sort()).toEqual(
      files.sort(),
    );
  });

  it("sorts posts newest first", () => {
    const times = posts.map((post) =>
      new Date(post.metadata.postedOn).getTime(),
    );

    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("parses the frontmatter every page relies on", () => {
    for (const post of posts) {
      expect(post.metadata.title, post.slug).toBeTruthy();
      expect(typeof post.metadata.summary, post.slug).toBe("string");
      expect(
        Number.isNaN(new Date(post.metadata.postedOn).getTime()),
        post.slug,
      ).toBe(false);
      expect(post.content, post.slug).not.toMatch(/^---/);
    }
  });
});
