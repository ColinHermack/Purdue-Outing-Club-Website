import { getPosts } from "@/app/news/utils";

export async function GET() {
  let posts = getPosts();
  let recentPosts = posts.slice(0, 3);
  let json = recentPosts.map((post) => {
    return {
      title: post.metadata.title,
      postedOn: post.metadata.postedOn,
      summary: post.metadata.summary,
      slug: post.slug,
    };
  });

  return new Response(JSON.stringify(json), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
