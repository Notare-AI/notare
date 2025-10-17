import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-background text-foreground">
      <div className="container mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          From Information Overload to Organized Insight
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Tired of juggling scattered notes and endless PDFs? Notare is the visual workspace for deep thinking. It's the smarter way to connect ideas and accelerate your learning.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/dashboard">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;