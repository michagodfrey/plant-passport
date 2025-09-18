import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building } from "lucide-react";
import { JurisdictionResources, ResourceTag } from "@/types/resources";

const RESOURCES: JurisdictionResources[] = [
  {
    key: "AUS",
    title: "Australia-wide",
    coatSrc: "state-logos/1912-coat-of-arms-1280.webp",
    links: [
      {
        label: "National Quarantine information (non-government)",
        href: "https://interstatequarantine.org.au/",
        tag: "Guide",
      },
      {
        label: "Australia's Biosecurity Policy and international trade",
        href: "https://www.agriculture.gov.au/biosecurity-trade/policy",
        tag: "National",
      },
      {
        label: "Current pest outbreaks in Australia",
        href: "https://www.outbreak.gov.au/current-outbreaks?kind=list",
        tag: "Outbreaks",
      },
    ],
  },
  {
    key: "NSW",
    title: "New South Wales",
    coatSrc: "state-logos/PRIMARY-nsw-government-logo.png",
    links: [
      {
        label: "Plant Biosecurity (NSW DPI)",
        href: "https://www.dpi.nsw.gov.au/dpi/biosecurity/plant-biosecurity",
        tag: "Guide",
      },
      {
        label: "Movement conditions: plants, soil, machinery",
        href: "https://www.dpi.nsw.gov.au/biosecurity2/plant/exotic-plant-pests-and-diseases/restrictions-on-moving-plants,-plant-products,-soil-and-equipment/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment2/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment/entry-conditions/potplants-soil-machinery",
        tag: "Manual",
      },
      {
        label: "Movement conditions: fresh produce",
        href: "https://www.dpi.nsw.gov.au/biosecurity2/plant/exotic-plant-pests-and-diseases/restrictions-on-moving-plants,-plant-products,-soil-and-equipment/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment2/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment/entry-conditions/fresh-produce",
        tag: "Manual",
      },
      {
        label: "NSW biosecurity zones & moving within NSW",
        href: "https://www.dpi.nsw.gov.au/dpi/biosecurity/plant-biosecurity/market-access-and-trade/nsw-movement-zones",
        tag: "Zones",
      },
      {
        label: "NSW DPI - contacts",
        href: "https://www.dpi.nsw.gov.au/dpi/biosecurity/plant-biosecurity/market-access-and-trade/contact-us",
        tag: "Contacts",
      },
    ],
  },
  {
    key: "NT",
    title: "Northern Territory",
    coatSrc: "state-logos/ntg-flag-flying2-cmyk.webp",
    links: [
      {
        label: "Plants & quarantine (overview)",
        href: "https://nt.gov.au/industry/agriculture/food-crops-plants-and-quarantine/plants-and-quarantine",
        tag: "Guide",
      },
      {
        label: "Northern Territory Plant Health Manual",
        href: "https://daf.nt.gov.au/publications/publications-search/publications-database/primary-industry/plants/plant-health-manual.pdf",
        tag: "Manual",
      },
      {
        label: "Plant Biosecurity - contacts",
        href: "https://nt.gov.au/industry/agriculture/food-crops-plants-and-quarantine/plants-and-quarantine/contact-plant-biosecurity",
        tag: "Contacts",
      },
    ],
  },
  {
    key: "QLD",
    title: "Queensland",
    coatSrc: "state-logos/Queensland_Government_logo.webp",
    links: [
      {
        label: "Plant Biosecurity (QLD DPI)",
        href: "https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/biosecurity/plants",
        tag: "Guide",
      },
      {
        label: "Queensland Biosecurity Manual",
        href: "https://www.dpi.qld.gov.au/__data/assets/pdf_file/0004/379138/qld-biosecurity-manual.pdf",
        tag: "Manual",
      },
      {
        label: "Biosecurity zones (QLD)",
        href: "https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/biosecurity/plants/moving/restrictions/zones",
        tag: "Zones",
      },
      {
        label: "QLD DPI contact us",
        href: "https://www.dpi.qld.gov.au/contact",
        tag: "Contacts",
      },
    ],
  },
  {
    key: "SA",
    title: "South Australia",
    coatSrc: "state-logos/Brand_SouthAust1_RGB.webp",
    links: [
      {
        label: "Plant Health",
        href: "https://pir.sa.gov.au/biosecurity/plant_health",
        tag: "Guide",
      },
      {
        label: "Plant Quarantine Standard",
        href: "https://pir.sa.gov.au/biosecurity/plant_health/plant_quarantine_standard_and_updated_conditions",
        tag: "Manual",
      },
      {
        label: "SA PIRSA contact us",
        href: "https://pir.sa.gov.au/contact-us",
        tag: "Contacts",
      },
    ],
  },
  {
    key: "TAS",
    title: "Tasmania",
    coatSrc: "state-logos/Tas-Gov-logo-colour-vert.webp",
    links: [
      {
        label: "Plant Biosecurity",
        href: "https://nre.tas.gov.au/biosecurity-tasmania/plant-biosecurity",
        tag: "Guide",
      },
      {
        label: "Plant Biosecurity Manual",
        href: "https://nre.tas.gov.au/biosecurity-tasmania/plant-biosecurity/plant-biosecurity-manual",
        tag: "Manual",
      },
      {
        label: "Tasmania Biosecurity - contact information",
        href: "https://nre.tas.gov.au/biosecurity-tasmania/plant-biosecurity",
        tag: "Contacts",
      },
    ],
  },
  {
    key: "VIC",
    title: "Victoria",
    coatSrc: "state-logos/VicGov-Victoria-Blue.png",
    links: [
      {
        label: "Moving plants & plant products",
        href: "https://agriculture.vic.gov.au/biosecurity/moving-plants-and-plant-products",
        tag: "Guide",
      },
      {
        label: "Plant Quarantine Manual",
        href: "https://agriculture.vic.gov.au/biosecurity/moving-plants-and-plant-products/plant-quarantine-manual",
        tag: "Manual",
      },
      {
        label: "Agriculture Victoria contact us",
        href: "https://agriculture.vic.gov.au/about/contact-us",
        tag: "Contacts",
      },
    ],
  },
  {
    key: "WA",
    title: "Western Australia",
    coatSrc: "state-logos/COA-with-text-GoWA-colour.webp",
    links: [
      {
        label: "Importing plants & products (info & DPIRD contact)",
        href: "https://www.dpird.wa.gov.au/businesses/biosecurity/importing-and-exporting-quarantine-wa/importing-plants-and-plant-products/",
        tag: "Guide",
      },
      {
        label: "Quarantine import search",
        href: "https://www.dpird.wa.gov.au/businesses/biosecurity/importing-and-exporting-quarantine-wa/importing-plants-and-plant-products/",
        tag: "Manual",
      },
      {
        label: "Western Australian Organism List (WAOL)",
        href: "https://www.dpird.wa.gov.au/online-tools/western-australian-organism-list/",
        tag: "Search",
      },
      {
        label: "WA DPIRD contact us",
        href: "https://www.dpird.wa.gov.au/about-us/contact-us/",
        tag: "Contacts",
      },
    ],
  },
];

const TAG_COLORS: Record<ResourceTag, string> = {
  Manual: "bg-primary/10 text-primary hover:bg-primary/20",
  Contacts: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  Zones: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  Guide: "bg-green-50 text-green-700 hover:bg-green-100",
  Search: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  Outbreaks: "bg-red-50 text-red-700 hover:bg-red-100",
  National: "bg-slate-50 text-slate-700 hover:bg-slate-100",
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
      />
    </div>
  );
}

function ResourceCard({
  jurisdiction,
}: {
  jurisdiction: JurisdictionResources;
}) {
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
                  className={`text-xs px-2 py-0.5 shrink-0 ${
                    TAG_COLORS[link.tag]
                  }`}
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

export function ResourceGrid() {
  return (
    <section id="resources" className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Official Resources & Contacts
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Direct links to plant quarantine authorities, manuals, and biosecurity
          information for each Australian jurisdiction
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESOURCES.map((jurisdiction) => (
          <ResourceCard key={jurisdiction.key} jurisdiction={jurisdiction} />
        ))}
      </div>
    </section>
  );
}
