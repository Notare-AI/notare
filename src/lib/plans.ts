export interface Plan {
  name: string;
  planId: 'free' | 'research-pro';
  price: string;
  description: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    name: 'Free',
    planId: 'free',
    price: '£0',
    description: 'Designed for exploring.',
    features: [
      'Process 5 PDFs with AI-generated insights',
      'Visual knowledge maps (Max 5)',
      'Sync across devices',
      'Export notes as Markdown',
    ],
  },
  {
    name: 'Research Pro',
    planId: 'research-pro',
    price: '£10',
    description: 'Designed for active students & researchers.',
    features: [
      'Unlimited PDF processing',
      'Full AI synthesis features',
      'Export summaries & notes',
      'Unlimited visual canvases',
      'Priority support',
    ],
  },
];