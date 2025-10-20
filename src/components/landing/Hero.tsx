import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/images/hero-notare-app.png'; // Assumed name; update if different

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
        <div className="flex justify-center gap-4 mb-12">
          <Button asChild size="lg" className="bg-primary text-primary-foreground">
            <Link to="/dashboard">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
        <div className="max-w-4xl mx-auto">
          <img 
            src={heroImage} 
            alt="Notare app interface showing visual note mapping and AI features" 
            className="w-full h-auto rounded-xl shadow-xl object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;