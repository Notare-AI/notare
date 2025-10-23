import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '£0',
    features: [
      '50 AI Credits/Month',
      '3 Canvases',
      '5 PDF Uploads'
    ]
  },
  {
    name: 'Personal',
    price: '£8/month',
    features: [
      '100 AI Credits/Month',
      'Unlimited Canvases',
      '20 PDF Uploads'
    ],
    isFeatured: true
  },
  {
    name: 'Professional',
    price: '£20/month',
    features: [
      '500 AI Credits/Month',
      'Unlimited Canvases',
      'Unlimited PDF Uploads'
    ]
  }
];

const PricingPreview = () => {
  return (
    <section id="pricing-preview" className="container py-20 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`border rounded-lg p-8 flex flex-col ${plan.isFeatured ? 'border-primary ring-2 ring-primary' : ''}`}>
            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            <p className="text-4xl font-bold mt-4">{plan.price}</p>
            <ul className="mt-6 space-y-3 text-muted-foreground flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button asChild variant="outline" size="lg">
          <Link to="/pricing">Compare All Plans</Link>
        </Button>
      </div>
    </section>
  );
};

export default PricingPreview;