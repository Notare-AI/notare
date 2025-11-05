import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Free',
    planId: 'free',
    href: '/login',
    priceMonthly: '£0',
    description: 'Designed for exploring.',
    features: [
      'Process 5 PDFs with AI-generated insights',
      'Visual knowledge maps',
      'Sync across devices',
      'Export notes as Markdown',
    ],
    cta: 'Start for Free',
    isFeatured: false,
  },
  {
    name: 'Research Pro',
    planId: 'research-pro',
    href: '/checkout?plan=research-pro',
    priceMonthly: '£10',
    description: 'Designed for active students & researchers.',
    features: [
      'Unlimited PDF processing',
      'Full AI synthesis features',
      'Export summaries & notes',
      'Unlimited visual canvases',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    isFeatured: true,
  },
];

const Pricing = () => {
  return (
    <section className="container py-20 md:py-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Simple pricing for serious research.</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Choose the plan that's right for you.
        </p>
      </div>
      <div className="mt-12 grid max-w-3xl mx-auto grid-cols-1 gap-8 md:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg border p-8 flex flex-col ${tier.isFeatured ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
          >
            <h3 className="text-2xl font-semibold">{tier.name}</h3>
            <p className="mt-4 text-muted-foreground h-12">{tier.description}</p>
            <p className="mt-4">
              <span className="text-4xl font-bold">{tier.priceMonthly}</span>
              {tier.name !== 'Free' && <span className="text-muted-foreground">/ month</span>}
            </p>
            <ul className="mt-8 space-y-4 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={tier.isFeatured ? 'default' : 'outline'} asChild>
              <Link to={tier.href}>{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;