// PlantPassport.ai Type Definitions

export type AustralianState = "QLD" | "NSW" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export type GuidedInput = {
  commodity: string;
  origin: AustralianState;
  destination: AustralianState;
  locationDetail?: { 
    address?: string; 
    suburb?: string; 
    postcode?: string; 
  };
};

export type AskInput = { 
  message: string; 
};

export type StructuredRule = {
  title: string;
  code?: string;
  requirement: string;
  actions: string[];
  documents?: string[];
  references?: string[];
  severity: "info" | "warning" | "blocked";
};

export type BackendResponse = {
  answer: string;
  structured: {
    commodity: string;
    origin: string;
    destination: string;
    zoneContext?: string;
    rules: StructuredRule[];
  };
};

export type QueryInput = GuidedInput | AskInput;