import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

const BlogComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <Construction className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-4">Our Blog is Coming Soon!</h1>
      <p className="max-w-xl text-lg text-muted-foreground mb-8">
        We're working hard to bring you insightful articles, tips, and updates about Notare. Stay tuned!
      </p>
      <Link to="/" className="text-primary font-semibold hover:underline">
        &larr; Back to Home
      </Link>
    </div>
  );
};

export default BlogComingSoon;