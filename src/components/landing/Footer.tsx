import { PenSquare, Twitter, Mail } from 'lucide-react';
import DiscordIcon from '@/components/icons/DiscordIcon';
import { Link } from 'react-router-dom';

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
        <div className="flex items-center gap-4">
          <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
          <a href="https://discord.gg/j7VHUmr8" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-muted-foreground hover:text-foreground transition-colors">
            <DiscordIcon className="h-5 w-5" />
          </a>
          <a href="https://x.com/ANomadicDev" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="mailto:NotareAI@outlook.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;