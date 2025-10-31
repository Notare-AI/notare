import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { plans } from '@/lib/plans';

const PricingPreview = () => {
  const previewPlans = plans.map(plan => {
    switch (plan.planId) {
      case 'free':
        return { ...plan, isFeatured: false };
      case 'research-pro':
        return { ...plan, isFeatured: true };
      default:
        return { ...plan, isFeatured: false };
    }
  });

  return (
    <section id="pricing-preview" className="container py-20 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Simple pricing for serious research.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {previewPlans.map((plan) => (
          <div key={plan.name} className={`border rounded-lg p-8 flex flex-col ${plan.isFeatured ? 'border-primary ring-2 ring-primary' : ''}`}>
            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            <p className="mt-2 text-muted-foreground h-12">{plan.description}</p>
            <p className="text-4xl font-bold mt-4">{plan.price}<span className="text-base font-normal text-muted-foreground">{plan.price !== '£0' ? '/month' : ''}</span></p>
            <ul className="mt-6 space-y-3 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button asChild variant="outline" size="lg">
          <Link to="/pricing">See Full Pricing Details</Link>
        </Button>
      </div>
    </section>
  );
};

export default PricingPreview;