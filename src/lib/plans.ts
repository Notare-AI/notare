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
    description: 'For exploring the basics of AI-powered research.',
    features: [
      'Process up to 5 PDFs',
      'Generate AI insights',
      'Try visual synthesis',
      '3 Canvases',
      '50 AI Credits/Month',
    ],
  },
  {
    name: 'Research Pro',
    planId: 'research-pro',
    price: '£10',
    description: 'For active students and researchers.',
    features: [
      'Unlimited PDFs',
      'Faster AI insights',
      'Export summaries & markdown',
      'Unlimited Canvases',
      '500 AI Credits/Month',
    ],
  },
];