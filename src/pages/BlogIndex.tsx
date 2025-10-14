import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import matter from 'gray-matter';

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
}

const BlogIndex = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Vite's import.meta.glob is a powerful way to import multiple files
    const postModules = import.meta.glob('/src/blog/posts/*.md', { as: 'raw', eager: true });
    
    const allPosts = Object.entries(postModules).map(([path, content]) => {
      const { data } = matter(content);
      const slug = path.split('/').pop()?.replace('.md', '') || '';
      
      return {
        slug,
        title: data.title || 'Untitled Post',
        date: data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
        description: data.description || '',
      };
    });

    // Sort posts by date, newest first
    allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setPosts(allPosts);
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight mb-8">The Notare Blog</h1>
      <div className="space-y-10">
        {posts.map((post) => (
          <article key={post.slug}>
            <h2 className="text-2xl font-bold mb-2">
              <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground mb-3">{post.date}</p>
            <p className="text-muted-foreground">{post.description}</p>
            <Link to={`/blog/${post.slug}`} className="text-primary font-semibold mt-4 inline-block">
              Read more &rarr;
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogIndex;