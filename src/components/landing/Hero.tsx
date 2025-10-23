import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-background text-foreground py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Turn Complex Knowledge into Visual Clarity—Instantly
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Notare is the AI-powered visual workspace for students, researchers, and professionals. Upload PDFs, extract key insights with AI, and build interconnected knowledge maps—all on an infinite canvas.
        </p>
        <div className="flex justify-center gap-4 mb-12">
          <Button asChild size="lg" className="bg-primary text-primary-foreground">
            <Link to="/dashboard">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;