import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="container py-20 md:py-24 text-center">
      <h2 className="text-3xl font-bold mb-6">Spend less time reading, more time writing.</h2>
      <Button asChild size="lg">
        <Link to="/dashboard">Start Free</Link>
      </Button>
    </section>
  );
};

export default CTASection;