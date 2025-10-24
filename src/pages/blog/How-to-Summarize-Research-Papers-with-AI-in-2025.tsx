import BlogLayout from '@/components/blog/BlogLayout';
import { posts } from '@/lib/blog';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

const post = posts.find(p => p.slug === 'how-to-summarize-research-papers-with-ai-in-2025');

const markdownContent = `
# How to Summarize Research Papers with AI in 2025

## Introduction
Summarizing research papers manually is time-consuming. AI tools like Notare can **cut this time by 80%** while improving comprehension.

## Step-by-Step Guide
1. **Upload Your PDF** to Notare’s infinite canvas.
2. **Let AI Generate a Summary** with one click.
3. **Highlight Key Points** and link them to your notes.
4. **Export as Markdown** for future reference.

## Why Use AI for Research?
- **Save time** (e.g., summarize a 50-page paper in minutes).
- **Improve retention** with visual mind maps.
- **Collaborate** with peers on shared canvases.

## Try Notare for Free
[Sign up here](/dashboard) to summarize your first PDF.
`;

const HowToSummarizeResearchPapersWithAI = () => {
  if (!post) return null;

  return (
    <BlogLayout>
      <article className="prose dark:prose-invert max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold !mb-2">{post.title}</h1>
          <p className="text-muted-foreground">
            Published on {format(new Date(post.date), 'MMMM dd, yyyy')} by {post.author}
          </p>
        </header>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
      </article>
    </BlogLayout>
  );
};

export default HowToSummarizeResearchPapersWithAI;