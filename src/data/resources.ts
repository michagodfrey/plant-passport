import { JurisdictionResources } from "@/types/resources";

export const RESOURCES: JurisdictionResources[] = [
  {
    key: "AUS",
    title: "Australia-wide",
    coatSrc: "/coats/aus.svg",
    links: [
      {
        label: "National Quarantine information",
        href: "https://interstatequarantine.org.au/producers/committees/quarantine-regulators/",
        tag: "National"
      },
      {
        label: "Current pest outbreaks in Australia",
        href: "https://www.outbreak.gov.au/current-outbreaks?kind=list",
        tag: "Outbreaks"
      }
    ]
  },
  {
    key: "NSW",
    title: "New South Wales",
    coatSrc: "/coats/nsw.svg",
    links: [
      {
        label: "NSW DPI – Contacts",
        href: "https://www.dpi.nsw.gov.au/biosecurity2/plant/market-access/contacts",
        tag: "Contacts"
      },
      {
        label: "Plant Biosecurity (NSW DPI)",
        href: "https://www.dpi.nsw.gov.au/dpi/biosecurity/plant-biosecurity",
        tag: "Guide"
      },
      {
        label: "Movement conditions: plants, soil, machinery",
        href: "https://www.dpi.nsw.gov.au/biosecurity2/plant/exotic-plant-pests-and-diseases/restrictions-on-moving-plants,-plant-products,-soil-and-equipment/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment2/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment/entry-conditions/potplants-soil-machinery",
        tag: "Guide"
      },
      {
        label: "Movement conditions: fresh produce",
        href: "https://www.dpi.nsw.gov.au/biosecurity2/plant/exotic-plant-pests-and-diseases/restrictions-on-moving-plants,-plant-products,-soil-and-equipment/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment2/information-for-restrictions-on-moving-plants,-plant-products,-soil-and-agricultural-equipment/entry-conditions/fresh-produce",
        tag: "Guide"
      },
      {
        label: "NSW biosecurity zones & moving within NSW",
        href: "https://www.dpi.nsw.gov.au/dpi/biosecurity/plant-biosecurity/market-access-and-trade/nsw-movement-zones",
        tag: "Zones"
      }
    ]
  },
  {
    key: "NT",
    title: "Northern Territory",
    coatSrc: "/coats/nt.svg",
    links: [
      {
        label: "Plants & quarantine (overview)",
        href: "https://nt.gov.au/industry/agriculture/food-crops-plants-and-quarantine/plants-and-quarantine",
        tag: "Guide"
      },
      {
        label: "Plant Biosecurity – contact",
        href: "https://nt.gov.au/industry/agriculture/food-crops-plants-and-quarantine/plants-and-quarantine/contact-plant-biosecurity",
        tag: "Contacts"
      }
    ]
  },
  {
    key: "QLD",
    title: "Queensland",
    coatSrc: "/coats/qld.svg",
    links: [
      {
        label: "Biosecurity zones (QLD)",
        href: "https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/biosecurity/plants/moving/restrictions/zones",
        tag: "Zones"
      },
      {
        label: "Moving within QLD",
        href: "https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/biosecurity/plants/moving/restrictions/within-qld",
        tag: "Guide"
      },
      {
        label: "Moving into QLD (PQM landing)",
        href: "https://www.business.qld.gov.au/industries/farms-fishing-forestry/agriculture/biosecurity/plants/moving/restrictions/into-qld",
        tag: "PQM"
      },
      {
        label: "Department contact (DAF/DPI)",
        href: "https://www.dpi.qld.gov.au/contact",
        tag: "Contacts"
      }
    ]
  },
  {
    key: "SA",
    title: "South Australia",
    coatSrc: "/coats/sa.svg",
    links: [
      {
        label: "Plant Quarantine Standard (PQS/PQM)",
        href: "https://pir.sa.gov.au/biosecurity/plant_health/plant_quarantine_standard_and_updated_conditions",
        tag: "PQM"
      },
      {
        label: "Importing commercial plants & products (plain English) + contacts",
        href: "https://pir.sa.gov.au/biosecurity/plant_health/importing_commercial_plants_and_plant_products",
        tag: "Guide"
      }
    ]
  },
  {
    key: "TAS",
    title: "Tasmania",
    coatSrc: "/coats/tas.svg",
    links: [
      {
        label: "Importing plants (info & contacts)",
        href: "https://nre.tas.gov.au/biosecurity-tasmania/biosecurity/importing-plants",
        tag: "Guide"
      },
      {
        label: "Plant Biosecurity Manual (PQM)",
        href: "https://nre.tas.gov.au/biosecurity-tasmania/plant-biosecurity/plant-biosecurity-manual",
        tag: "PQM"
      }
    ]
  },
  {
    key: "VIC",
    title: "Victoria",
    coatSrc: "/coats/vic.svg",
    links: [
      {
        label: "Moving plants & plant products (PQM + contact)",
        href: "https://agriculture.vic.gov.au/biosecurity/moving-plants-and-plant-products",
        tag: "PQM"
      }
    ]
  },
  {
    key: "WA",
    title: "Western Australia",
    coatSrc: "/coats/wa.svg",
    links: [
      {
        label: "Importing plants & products (info & DPIRD contact)",
        href: "https://www.dpird.wa.gov.au/businesses/biosecurity/importing-and-exporting-quarantine-wa/importing-plants-and-plant-products/",
        tag: "Guide"
      },
      {
        label: "Quarantine import search",
        href: "https://www.dpird.wa.gov.au/businesses/biosecurity/importing-and-exporting-quarantine-wa/importing-plants-and-plant-products/",
        tag: "Search"
      },
      {
        label: "Western Australian Organism List (WAOL)",
        href: "https://www.dpird.wa.gov.au/online-tools/western-australian-organism-list/",
        tag: "Search"
      }
    ]
  }
];