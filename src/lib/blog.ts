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
];