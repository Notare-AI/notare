import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { plans } from '@/lib/plans';

const landingPagePlans = plans.map(plan => {
  switch (plan.planId) {
    case 'free':
      return { ...plan, cta: 'Start for Free', link: '/login', isFeatured: false };
    case 'research-pro':
      return { ...plan, cta: 'Upgrade to Pro', link: '/checkout?plan=research-pro', isFeatured: true };
    default:
      return { ...plan, cta: 'Get Started', link: '/login', isFeatured: false };
  }
});

const Pricing = () => {
  return (
    <section className="container py-20 md:py-24">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
          Choose the plan that's right for you. No hidden fees.
        </p>
      </div>
      <div className="mt-12 grid max-w-3xl mx-auto grid-cols-1 gap-8 md:grid-cols-2">
        {landingPagePlans.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg border p-8 flex flex-col ${tier.isFeatured ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
          >
            <h3 className="text-2xl font-semibold">{tier.name}</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold">{tier.price}</span>
              {tier.planId !== 'free' && <span className="text-muted-foreground">/ month</span>}
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
              <Link to={tier.link}>{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;