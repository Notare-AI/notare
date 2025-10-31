import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroPreview from '@/images/hero-preview.png';

const Hero = () => {
  return (
    <section className="relative bg-background text-foreground py-20 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Accelerate your literature review.
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Upload research papers, extract AI insights, and connect key ideas — all in one visual workspace.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/dashboard">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#demo">Watch 30-Second Demo</a>
          </Button>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-4 mt-16">
        <img src={heroPreview} alt="Notare visual workspace demo" className="rounded-lg shadow-2xl border" />
      </div>
    </section>
  );
};

export default Hero;