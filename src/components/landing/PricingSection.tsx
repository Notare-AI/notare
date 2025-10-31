import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { plans } from '@/lib/plans';

const PricingSection = () => {
  const proPlan = plans.find(p => p.planId === 'research-pro');
  const freePlan = plans.find(p => p.planId === 'free');

  return (
    <section id="pricing" className="container py-20 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Simple pricing for faster research.</h2>
      </div>
      <div className="max-w-4xl mx-auto border rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-6 font-semibold">Plan</th>
              <th className="p-6 font-semibold">For</th>
              <th className="p-6 font-semibold hidden md:table-cell">Key Benefit</th>
              <th className="p-6 font-semibold text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {freePlan && (
              <tr className="border-b">
                <td className="p-6 font-semibold">{freePlan.name}</td>
                <td className="p-6 text-muted-foreground">Exploring basics</td>
                <td className="p-6 text-muted-foreground hidden md:table-cell">Process up to 5 PDFs, generate insights, and try visual synthesis</td>
                <td className="p-6 font-semibold text-right">{freePlan.price}</td>
              </tr>
            )}
            {proPlan && (
              <tr className="bg-primary/5">
                <td className="p-6 font-semibold">{proPlan.name}</td>
                <td className="p-6 text-muted-foreground">Active students & researchers</td>
                <td className="p-6 text-muted-foreground hidden md:table-cell">Unlimited PDFs, faster AI insights, export summaries and markdown</td>
                <td className="p-6 font-semibold text-right">{proPlan.price}/month</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-center mt-12">
        <Button asChild size="lg">
          <Link to="/dashboard">Start Free → Upgrade Anytime</Link>
        </Button>
      </div>
    </section>
  );
};

export default PricingSection;