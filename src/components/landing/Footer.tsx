import { PenSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex items-center gap-2">
          <PenSquare size={20} />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Notare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;