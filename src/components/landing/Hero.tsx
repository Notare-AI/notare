import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroPreviewImage from '@/images/hero-preview.png';

const Hero = () => {
  return (
    <section className="relative bg-background text-foreground py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <img
          src={HeroPreviewImage}
          alt="A preview of the Notare application canvas showing connected notes and ideas."
          className="rounded-lg shadow-2xl border border-border/20"
        />
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg">
          <Link to="/dashboard">
            Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;