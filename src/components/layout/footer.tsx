
import Link from 'next/link';
import { Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-1 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold mb-2">Generations Connect</h3>
            <p className="text-accent-foreground/80 text-lg">Connecting communities, one task at a time.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-accent-foreground/20 pt-6 text-center text-accent-foreground/80 text-base">
          &copy; {new Date().getFullYear()} Generations Connect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
