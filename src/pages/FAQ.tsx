import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LandingLayout from '@/components/landing/LandingLayout';

const markdownContent = `
# Frequently Asked Questions

## What is Notare?
Notare is an AI-powered visual knowledge platform that helps users summarize PDFs, extract key insights, and build interconnected mind maps on an infinite canvas.

## How accurate is Notare’s AI?
Notare uses GPT-4 and fine-tuned models to ensure high accuracy. Users can edit summaries for precision.

## Is my data secure?
Yes. Notare uses Supabase for secure authentication and data storage. You can export your data anytime.
`;

const FAQPage = () => {
  return (
    <LandingLayout>
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Notare?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Notare is an AI-powered visual knowledge platform that helps users summarize PDFs, extract key insights, and build interconnected mind maps on an infinite canvas."
                }
              },
              {
                "@type": "Question",
                "name": "How does Notare’s AI work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Notare uses GPT-4 and fine-tuned models to generate summaries, key points, and contextual notes from PDFs and user inputs."
                }
              },
              {
                "@type": "Question",
                "name": "Can I export my notes from Notare?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! You can export individual notes or entire canvases as Markdown files to avoid vendor lock-in."
                }
              }
            ]
          }
        `}
      </script>
      <article className="prose dark:prose-invert max-w-4xl mx-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
      </article>
    </LandingLayout>
  );
};

export default FAQPage;