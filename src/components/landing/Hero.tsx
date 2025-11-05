import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-background text-foreground py-20 md:py-32">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Turn Complex Research into Visual Clarity—Instantly
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Notare is an <strong className="font-semibold">AI-powered visual knowledge platform</strong> that helps students, researchers, and professionals <strong className="font-semibold">summarize PDFs, extract key insights, and build interconnected mind maps</strong>—all on an infinite canvas.
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link to="/dashboard">Start Mapping for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;