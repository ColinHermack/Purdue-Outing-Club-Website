/**
 * A data type object representing a preview of a news post. Returned by the
 * /api/news/recent endpoint and consumed across the server/client boundary.
 *
 * @author Colin Hermack
 */

export default class NewsPreviewDTO {
  title?: string;
  postedOn?: string;
  summary?: string;
  slug?: string;
}
