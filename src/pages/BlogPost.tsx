import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import { Loader2 } from 'lucide-react';

interface PostData {
  title: string;
  date: string;
  author: string;
  content: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postModule = await import(`../blog/posts/${slug}.md?raw`);
        const rawContent = postModule.default;
        const { data, content } = matter(rawContent);
        
        setPost({
          title: data.title || 'Untitled Post',
          date: data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
          author: data.author || 'Anonymous',
          content,
        });
      } catch (e) {
        setError('Post not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <Link to="/blog" className="text-primary hover:underline">
          &larr; Back to all posts
        </Link>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-3">{post.title}</h1>
        <p className="text-muted-foreground">
          By {post.author} on {post.date}
        </p>
      </header>
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
      <div className="mt-12">
        <Link to="/blog" className="text-primary font-semibold">
          &larr; Back to all posts
        </Link>
      </div>
    </article>
  );
};

export default BlogPost;