/**
 * This route gets the most recent POC news articles and sends metadata to the client
 *
 * @author Colin Hermack
 */

import { getPosts } from "@/app/news/utils";

/**
 * The actual route handler. Gets the 3 most recent news posts.
 *
 * @returns An HTTP response object.
 */
export async function GET() {
  let posts = getPosts();
  let recentPosts = posts.slice(0, 3); // Get first 3 posts

  let json = recentPosts.map((post) => {
    return {
      title: post.metadata.title,
      postedOn: post.metadata.postedOn,
      summary: post.metadata.summary,
      slug: post.slug,
    };
  }); // Map over the posts and extract only the data we want to send to the client

  return new Response(JSON.stringify(json), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  }); // Send to the client with code 200 OK
}
