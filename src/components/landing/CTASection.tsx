import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="bg-muted/50">
      <div className="container py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Spend less time reading, more time writing.</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join researchers using Notare to make sense of their literature faster.
        </p>
        <Button asChild size="lg">
          <Link to="/dashboard">Start Free Today</Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;