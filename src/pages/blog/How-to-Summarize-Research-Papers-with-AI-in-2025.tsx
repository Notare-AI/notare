import BlogLayout from '@/components/blog/BlogLayout';
import { posts } from '@/lib/blog';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'react-markdown';
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
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "How to Summarize Research Papers with AI in 2025",
            "description": "Discover how AI tools like Notare can drastically reduce the time spent summarizing research papers, improving comprehension and retention.",
            "datePublished": "${format(new Date(post.date), 'yyyy-MM-dd')}",
            "dateModified": "${format(new Date(post.date), 'yyyy-MM-dd')}",
            "author": {
              "@type": "Person",
              "name": "${post.author}",
              "url": "https://notare.uk/about"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Notare",
              "logo": {
                "@type": "ImageObject",
                "url": "https://notare.uk/src/images/Notare%20logo.png",
                "width": "600",
                "height": "60"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://notare.uk/blog/how-to-summarize-research-papers-with-ai-in-2025"
            },
            "image": {
              "@type": "ImageObject",
              "url": "https://notare.uk/images/blog-summarize-research-papers.png",
              "width": "1200",
              "height": "630"
            },
            "keywords": ["AI research papers", "summarize research", "AI summarization", "academic AI tools"]
          }
        `}
      </script>
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Summarize Research Papers with AI in 2025",
            "description": "Step-by-step guide to using AI tools like Notare to summarize PDFs and extract key insights from research papers.",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Upload Your PDF",
                "text": "Upload your research PDF to Notare's infinite canvas.",
                "image": "https://notare.uk/images/pdf-upload-demo.gif",
                "url": "https://notare.uk/blog/how-to-summarize-research-papers-with-ai-in-2025#step1"
              },
              {
                "@type": "HowToStep",
                "name": "Let AI Generate a Summary",
                "text": "Use Notare's AI features to generate a concise summary of your PDF with one click.",
                "url": "https://notare.uk/blog/how-to-summarize-research-papers-with-ai-in-2025#step2"
              },
              {
                "@type": "HowToStep",
                "name": "Highlight Key Points",
                "text": "Highlight important sections and link them to your notes on the canvas.",
                "url": "https://notare.uk/blog/how-to-summarize-research-papers-with-ai-in-2025#step3"
              },
              {
                "@type": "HowToStep",
                "name": "Export as Markdown",
                "text": "Export your summarized notes and key points as Markdown for future reference or use in other tools.",
                "url": "https://notare.uk/blog/how-to-summarize-research-papers-with-ai-in-2025#step4"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Notare"
              }
            ],
            "totalTime": "PT10M"
          }
        `}
      </script>
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