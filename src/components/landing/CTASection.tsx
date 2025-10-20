import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="container py-20 md:py-24 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Revolutionize Your Note Taking?</h2>
      <p className="text-lg text-muted-foreground mb-8">Start using the best AI note taking app today.</p>
      <Button asChild size="lg">
        <Link to="/dashboard">Get Started Free</Link>
      </Button>
    </section>
  );
};

export default CTASection;