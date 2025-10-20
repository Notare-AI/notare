export interface Plan {
  name: string;
  planId: 'free' | 'personal' | 'professional';
  price: string;
  description: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    name: 'Free',
    planId: 'free',
    price: '£0',
    description: 'For getting started with the core features.',
    features: [
      'Synced notes across devices',
      'Privacy - no data training!',
      '500mb of storage',
      '10 AI credits',
      'Unlimited notes',
      '3 Canvases',
      '1 PDF upload per canvas',
    ],
  },
  {
    name: 'Personal',
    planId: 'personal',
    price: '£8',
    description: 'For individuals who need more power and flexibility.',
    features: [
      'Synced notes across devices',
      'Privacy - no data training!',
      '1GB of storage',
      '500 AI credits',
      'Unlimited Notes',
      'Unlimited Canvas',
      '10 PDFs per canvas',
      'Downloadable markdown notes',
    ],
  },
  {
    name: 'Professional',
    planId: 'professional',
    price: '£15',
    description: 'For power users who need advanced features.',
    features: [
      'Synced notes across devices',
      'Privacy - no data training!',
      '5GB of storage',
      '1,000 AI credits',
      'Unlimited Notes',
      'Unlimited Canvas',
      '50 PDFs per canvas',
      'Downloadable markdown notes',
    ],
  },
];