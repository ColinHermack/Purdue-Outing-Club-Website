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

export function CustomMDX(props: ICustomMDXProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  );
}
