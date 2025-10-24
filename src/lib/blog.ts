export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
}

export const posts: Post[] = [
  {
    slug: 'a-step-by-step-guide-to-using-notare',
    title: 'A Step-by-Step Guide to Using Notare: How to Maximize Your Experience',
    description: 'Learn how to get started with Notare, from creating your first canvas to using advanced AI features. This guide covers everything you need to know to turn complex knowledge into visual clarity.',
    date: '2023-10-26', // Using a placeholder date
    author: 'The Notare Team',
  },
  {
    slug: 'how-to-summarize-research-papers-with-ai-in-2025',
    title: 'How to Summarize Research Papers with AI in 2025',
    description: 'Discover how AI tools like Notare can drastically reduce the time spent summarizing research papers, improving comprehension and retention.',
    date: '2024-07-25', // Placeholder for new post
    author: 'The Notare Team',
  },
  {
    slug: 'organize-research-notes-ai',
    title: 'How to Organize Research Notes with AI: A Step-by-Step Guide for Students and Academics',
    description: 'Struggling to organize research notes? Learn how to use AI tools like Notare to summarize PDFs, extract key insights, and build visual knowledge maps—saving hours of manual work. Try it for free!',
    date: '2025-10-25',
    author: 'Niall Parkinson',
  },
];