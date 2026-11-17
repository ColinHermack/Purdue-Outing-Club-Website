# `newsposts/`

Each `.mdx` file here is one article on `/news`. The file name without `.mdx` is the URL slug, so
`SewerCaving.mdx` is `/news/SewerCaving`. Use PascalCase names with no spaces.

## Format

```mdx
---
title: "Sewer Caving at Purdue 1970"
postedOn: "2014-08-27"
summary: "One or two sentences shown on the news list and home page."
author: "Jane Doe"
---

The article body, in Markdown.

## A subheading

- Lists, **bold**, [links](https://example.com) and images (`![alt](/image.jpg)`) all work.
```

- All four frontmatter fields are required. `postedOn` must be `YYYY-MM-DD`.
- Posts are sorted newest first. The three newest appear on the home page.
- Despite the `.mdx` extension, posts are rendered as **plain Markdown** with `remark-html`. JSX components inside a
  post will not render.
- Put images in `public/` (for example `public/news/my-photo.jpg`) and reference them as `/news/my-photo.jpg`.
- The frontmatter parser is simple: one `key: "value"` per line, no nested values.

Posts are read from disk when the site is built, so a new post appears after its pull request is merged and deployed.
