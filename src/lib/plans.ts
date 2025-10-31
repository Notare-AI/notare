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
      '20 AI Credits/Month',
      '3 Canvases',
      '5 PDF Uploads',
      'Synced notes across devices',
      'Privacy - no data training!',
      '500mb of storage',
      'Unlimited notes',
    ],
  },
  {
    name: 'Personal',
    planId: 'personal',
    price: '£8',
    description: 'For individuals who need more power and flexibility.',
    features: [
      '250 AI Credits/Month',
      'Unlimited Canvases',
      '20 PDF Uploads',
      'Synced notes across devices',
      'Privacy - no data training!',
      '1GB of storage',
      'Unlimited Notes',
      'Downloadable markdown notes',
    ],
  },
  {
    name: 'Professional',
    planId: 'professional',
    price: '£20',
    description: 'For power users who need advanced features.',
    features: [
      '500 AI Credits/Month',
      'Unlimited Canvases',
      'Unlimited PDF Uploads',
      'Synced notes across devices',
      'Privacy - no data training!',
      '5GB of storage',
      'Unlimited Notes',
      'Downloadable markdown notes',
    ],
  },
];