import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroPreviewImage from '@/images/hero-preview.png';

const Hero = () => {
  return (
    <section className="relative bg-background text-foreground py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          The Best Note Taking App for Visual Thinkers and AI-Powered Insights
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Struggling with scattered notes, endless PDF scrolling, and forgotten ideas? Notare is the ultimate AI note taking tool that organizes your thoughts on an infinite canvas, extracts key insights from documents, and ensures privacy—no data training ever.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="bg-primary text-primary-foreground">
            <Link to="/dashboard">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
        <img
          src={HeroPreviewImage}
          alt="Notare AI note taking app interface showing visual knowledge maps, PDF integration, and AI summaries for efficient note organization"
          className="mt-12 rounded-lg shadow-2xl border border-border/20 max-w-full"
        />
      </div>
    </section>
  );
};

export default Hero;