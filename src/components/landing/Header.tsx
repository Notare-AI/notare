import { PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-14 max-w-screen-2xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <PenSquare size={24} />
          <span className="font-bold text-lg">Notare</span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/what-is-notare">What is Notare?</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/blog">Blog</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;