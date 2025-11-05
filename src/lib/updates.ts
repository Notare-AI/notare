import { BrainCircuit, Link, Zap } from 'lucide-react';
import { FC, SVGProps } from 'react';

export const LATEST_UPDATE_VERSION = '2024-08-01-contextual-ai';

interface Update {
  icon: FC<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

export const updates: Update[] = [
  {
    icon: BrainCircuit,
    title: 'Full Contextual AI Chat',
    description:
      'The AI assistant in each note can now see the content of all connected notes in a branch, allowing for powerful, synthesized insights across your entire knowledge map.',
  },
  {
    icon: Link,
    title: 'Smarter Note Connections',
    description:
      'When you ask the AI about a note, it now understands the immediate context from its direct neighbors, providing more relevant and accurate answers.',
  },
  {
    icon: Zap,
    title: 'Enhanced AI Performance',
    description:
      'We\'ve optimized the backend calls to our AI models, resulting in faster response times for summaries, key points, and chat interactions.',
  },
];