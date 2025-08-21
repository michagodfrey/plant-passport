import { Leaf } from "lucide-react";

export function Header() {
  return (
    <header className="header-gradient shadow-medium print-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                PlantPassport.ai
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                Fast, accurate plant movement rules across Australia
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#faqs" 
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              FAQs
            </a>
            <a 
              href="#resources" 
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              Resources
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}