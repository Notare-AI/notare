import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import HeroPreviewImage from '@/images/hero-preview.png';

const Hero = () => {
  return (
    <section className="container flex flex-col items-center justify-center py-20 md:py-32 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
        Speed Up Learning With Network Note Taking?
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Notare is an intelligent canvas that connects your documents, notes, and ideas.
        Upload PDFs, generate insights with AI, and build visual knowledge maps to supercharge your learning.
      </p>
      <div className="mt-12 w-full max-w-5xl">
        <img 
          src={HeroPreviewImage} 
          alt="Notare application preview showing a visual knowledge map with connected nodes and a PDF document" 
          className="rounded-lg shadow-2xl border border-border/20"
        />
      </div>
      <div className="mt-12">
        <Button size="lg" asChild>
          <Link to="/login">Get Started for Free</Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;