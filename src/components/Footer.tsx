import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t print-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 PlantPassport.ai. Helping ensure compliant plant movements across Australia.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <Separator orientation="vertical" className="h-4" />
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This tool provides guidance only. Always verify current requirements with relevant state authorities and biosecurity agencies.
          </p>
        </div>
      </div>
    </footer>
  );
}