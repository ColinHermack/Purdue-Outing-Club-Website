/**
 * Builds the list of page numbers to render, collapsing long runs into ellipses so the control
 * stays a fixed width no matter how many members are in the directory.
 *
 * @param page The currently selected page.
 * @param pageCount The total number of pages.
 * @returns Page numbers to render, with null marking a gap.
 */
export function buildPageItems(
  page: number,
  pageCount: number,
): (number | null)[] {
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const visible = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  return visible.flatMap((p, index) =>
    index > 0 && p - visible[index - 1] > 1 ? [null, p] : [p],
  );
}
