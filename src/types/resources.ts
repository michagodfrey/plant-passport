// Resource types for official state/territory links

export type ResourceTag = "Manual" | "Contacts" | "Zones" | "Guide" | "Search" | "Outbreaks" | "National";

export type ResourceLink = {
  label: string;
  href: string;
  tag?: ResourceTag;
};

export type JurisdictionKey = "AUS" | "NSW" | "NT" | "QLD" | "SA" | "TAS" | "VIC" | "WA";

export type JurisdictionResources = {
  key: JurisdictionKey;
  title: string;
  coatSrc?: string; // e.g., "/coats/qld.svg"
  links: ResourceLink[];
};