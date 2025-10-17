import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingTiers = [
  {
    name: 'Free',
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
    cta: 'Start for Free',
    isFeatured: false,
  },
  {
    name: 'Personal',
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
    cta: 'Upgrade to Personal',
    isFeatured: true,
  },
  {
    name: 'Professional',
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
    cta: 'Go Professional',
    isFeatured: false,
  },
];

const Pricing = () => {
  return (
    <section className="container py-20 md:py-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Choose the plan that's right for you.
        </p>
      </div>
      <div className="mt-12 grid max-w-6xl mx-auto grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg border p-8 flex flex-col ${tier.isFeatured ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
          >
            <h3 className="text-2xl font-semibold">{tier.name}</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-muted-foreground">/ month</span>
            </p>
            <p className="mt-4 text-muted-foreground h-12">{tier.description}</p>
            <ul className="mt-8 space-y-4 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={tier.isFeatured ? 'default' : 'outline'} asChild>
              <Link to="/login">{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;