import BlogLayout from '@/components/blog/BlogLayout';
import { posts } from '@/lib/blog';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BlogPage = () => {
  return (
    <BlogLayout>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold">The Notare Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Insights, guides, and updates from the Notare team.
          </p>
        </header>
        <div className="space-y-8">
          {posts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="block group">
              <article className="p-6 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">{post.title}</h2>
                <p className="text-muted-foreground mt-2">
                  {format(new Date(post.date), 'MMMM dd, yyyy')}
                </p>
                <p className="mt-4">{post.description}</p>
                <p className="mt-4 font-semibold text-primary">Read more &rarr;</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </BlogLayout>
  );
};

export default BlogPage;