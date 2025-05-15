/**
 * Various HTML components customized for use with MDX files in the news articles.
 *
 * @author Colin Hermack
 */

import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";

interface ITablePropData {
  headers: string[];
  rows: string[];
}

interface ITableProps {
  data: ITablePropData;
}

/**
 * Renders a table component for use in MDX files.
 *
 * @param {ITableProps} props - The table data containing headers and rows.
 * @param {string[]} props.data.headers - An array of header strings for the table columns.
 * @param {string[][]} props.data.rows - A 2D array representing the table rows, where each sub-array contains cell values.
 *
 * @returns A JSX element representing a table.
 */

function Table({ data }: ITableProps) {
  let headers = data.headers.map((header: string, index: number) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row: any, index: any) => (
    <tr key={index}>
      {row.map((cell: any, cellIndex: any) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

interface ICustomLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * A custom link component for use with MDX files.
 *
 * If the href begins with a slash, it is treated as a local link and wrapped in a <Link> component.
 * If the href begins with a hash, it is treated as a jump link and wrapped in an <a> component.
 * Otherwise, it is assumed to be an external link and wrapped in an <a> component with rel="noopener noreferrer" and target="_blank".
 *
 * @param {ICustomLinkProps} props - The properties for the link.
 * @param {string} props.href - The href attribute of the link.
 * @param {React.ReactNode} props.children - The content of the link.
 *
 * @returns A JSX element representing the link.
 */
function CustomLink(props: ICustomLinkProps) {
  let href = props.href;

  if (href.startsWith("/")) {
    return <Link {...props}>{props.children}</Link>;
  }

  if (href.startsWith("#")) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a {...props} />;
  }

  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a rel="noopener noreferrer" target="_blank" {...props} />;
}

interface IRoundedImageProps {
  src: string;
  alt: string;
}

function RoundedImage(props: IRoundedImageProps) {
  return <Image className="rounded-lg" {...props} />;
}

/**
 * Creates a slug from the given string.
 *
 * The slug is created by first converting the string to lowercase and removing whitespace from both ends.
 * Then, spaces are replaced with dashes, "&" is replaced with "-and-", and all non-word characters except for dashes are removed.
 * Finally, multiple dashes are replaced with a single dash.
 *
 * @param {string} str - The string to create a slug from.
 *
 * @returns The slugified string.
 */
function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with "and"
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

interface IHeaderProps {
  children: string;
}

/**
 * Creates a heading component of the given level (1-6).
 *
 * The created component will generate a slug from the given children and add it as the id attribute of the heading.
 * This allows the heading to be linked to with a hash link. A link to the heading will also be created with the class "anchor".
 *
 * @param {number} level - The level of the heading (1-6).
 *
 * @returns A new heading component of the given level.
 */
function createHeading(level: number) {
  const Heading = ({ children }: IHeaderProps) => {
    let slug = slugify(children);

    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  Table,
};

interface ICustomMDXProps {
  source: string;
  components?: any;
}

/**
 * A custom MDX component which uses the {@link https://github.com/vercel/next-mdx-remote `next-mdx-remote`} library to render MDX content.
 *
 * @remarks
 * This component is a wrapper for `MDXRemote` which adds support for custom components, such as links and images.
 * It is meant to be used with the `getStaticProps` method of a Next.js page, in which case the `source` prop should contain the MDX content.
 *
 * @param {ICustomMDXProps} props - The properties for the component.
 * @param {string} props.source - The MDX content to be rendered.
 * @param {React.ComponentProps<any> | undefined} [props.components] - Optional custom components to be used for rendering the MDX content.
 *
 * @returns A JSX element representing the rendered MDX content.
 */
export function CustomMDX(props: ICustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
