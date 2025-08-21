import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Leaf, Building } from "lucide-react";
import { JurisdictionResources, ResourceTag } from "@/types/resources";

interface ResourceGridProps {
  resources: JurisdictionResources[];
}

const TAG_COLORS: Record<ResourceTag, string> = {
  PQM: "bg-primary/10 text-primary hover:bg-primary/20",
  Contacts: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  Zones: "bg-orange-50 text-orange-700 hover:bg-orange-100", 
  Guide: "bg-green-50 text-green-700 hover:bg-green-100",
  Search: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  Outbreaks: "bg-red-50 text-red-700 hover:bg-red-100",
  National: "bg-slate-50 text-slate-700 hover:bg-slate-100"
};

function CoatOfArms({ src, title }: { src?: string; title: string }) {
  if (!src) {
    return (
      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-lg">
        <Building className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-16 h-16">
      <img 
        src={src} 
        alt={`${title} coat of arms`}
        className="max-w-full max-h-full object-contain"
        onError={(e) => {
          // Fallback to leaf icon if coat of arms fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div 
        className="hidden items-center justify-center w-16 h-16 bg-muted rounded-lg" 
        style={{ display: 'none' }}
      >
        <Leaf className="w-8 h-8 text-muted-foreground" />
      </div>
    </div>
  );
}

function ResourceCard({ jurisdiction }: { jurisdiction: JurisdictionResources }) {
  return (
    <Card className="h-full hover:shadow-medium transition-shadow duration-200">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <CoatOfArms src={jurisdiction.coatSrc} title={jurisdiction.title} />
        </div>
        <CardTitle className="text-lg">{jurisdiction.title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {jurisdiction.links.map((link, index) => (
            <li key={index} className="flex items-center justify-between gap-2">
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors group flex-1"
                aria-label={`${jurisdiction.title}: ${link.label}`}
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="group-hover:underline">{link.label}</span>
              </a>
              
              {link.tag && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0.5 shrink-0 ${TAG_COLORS[link.tag]}`}
                >
                  {link.tag}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ResourceGrid({ resources }: ResourceGridProps) {
  return (
    <section id="resources" className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Official Resources & Contacts
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Direct links to plant quarantine authorities, manuals, and biosecurity information for each Australian jurisdiction
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((jurisdiction) => (
          <ResourceCard key={jurisdiction.key} jurisdiction={jurisdiction} />
        ))}
      </div>
    </section>
  );
}