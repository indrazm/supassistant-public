import { useQuery } from "@tanstack/react-query";

type Post = {
  id: number;
  title: string;
};

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }
  return res.json();
}

export function PostsList() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isPending) {
    return <main>Loading posts…</main>;
  }

  if (isError) {
    return <main>Error: {error.message}</main>;
  }

  return (
    <main>
      <h1>Platform</h1>
      <p>Posts via TanStack Query:</p>
      <ul>
        {data.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
