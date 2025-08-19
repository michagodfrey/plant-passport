import { GuidedInput, AskInput, BackendResponse, QueryInput } from "@/types/plant-passport";

// Mock commodities that are fire ant carriers
const FIRE_ANT_CARRIERS = [
  "nursery stock",
  "potatoes", 
  "mulch",
  "soil",
  "turf",
  "hay",
  "straw"
];

const MOCK_RESPONSES: Record<string, BackendResponse> = {
  "nursery_stock_qld_nsw": {
    answer: "Moving nursery stock from QLD to NSW requires careful attention to fire ant regulations. Since nursery stock is a known fire ant carrier and you're moving from Queensland, you'll need a Plant Health Assurance Certificate (PHAC) and must comply with IR15 requirements. The plants must be grown in approved growing media and inspected before movement.",
    structured: {
      commodity: "nursery stock",
      origin: "QLD",
      destination: "NSW", 
      zoneContext: "Fire ant carrier from regulated state",
      rules: [
        {
          title: "Import Requirement 15 — Red Imported Fire Ant",
          code: "IR15",
          requirement: "Nursery stock must be grown in approved growing media and certified free from fire ant infestation",
          actions: [
            "Obtain Plant Health Assurance Certificate (PHAC)",
            "Use only approved growing media",
            "Conduct pre-movement inspection",
            "Maintain movement records"
          ],
          documents: ["Plant Health Assurance Certificate (PHAC)", "Notice of Intention (NoI)"],
          references: ["IR15 Red Imported Fire Ant", "https://example.gov.au/ir15"],
          severity: "warning"
        },
        {
          title: "General Plant Movement Requirements",
          code: "GEN001",
          requirement: "All interstate plant movements must be accompanied by proper documentation",
          actions: [
            "Complete interstate movement documentation",
            "Ensure plants are healthy and pest-free"
          ],
          documents: ["Movement certificate"],
          severity: "info"
        }
      ]
    }
  },
  
  "potatoes_wa_vic": {
    answer: "Moving potatoes from WA to VIC is generally straightforward as WA has strict quarantine controls. However, you'll still need to ensure compliance with potato cyst nematode requirements and obtain appropriate certification.",
    structured: {
      commodity: "potatoes",
      origin: "WA",
      destination: "VIC",
      zoneContext: "Low risk pathway - WA to VIC",
      rules: [
        {
          title: "Potato Cyst Nematode Requirements",
          code: "PCN001",
          requirement: "Potatoes must be sourced from PCN-free areas or treated accordingly",
          actions: [
            "Obtain phytosanitary certificate",
            "Verify PCN-free status of source property"
          ],
          documents: ["Phytosanitary certificate"],
          references: ["PCN Management Protocol"],
          severity: "info"
        }
      ]
    }
  },
  
  "general_ask": {
    answer: "I can help you understand plant movement requirements between Australian states. Each commodity and pathway has specific requirements depending on pest risks, quarantine zones, and biosecurity protocols. Would you like to provide specific details about what you're moving and where?",
    structured: {
      commodity: "General inquiry",
      origin: "Not specified",
      destination: "Not specified",
      rules: [
        {
          title: "General Information",
          requirement: "All interstate plant movements require compliance with relevant Import Requirements",
          actions: [
            "Identify specific commodity and pathway",
            "Check state-specific requirements",
            "Obtain necessary certifications"
          ],
          severity: "info"
        }
      ]
    }
  }
};

function generateMockKey(input: QueryInput): string {
  if ('message' in input) {
    return 'general_ask';
  }
  
  const commodity = input.commodity.toLowerCase().replace(/\s+/g, '_');
  const origin = input.origin.toLowerCase();
  const destination = input.destination.toLowerCase();
  
  return `${commodity}_${origin}_${destination}`;
}

export function isFireAntCarrier(commodity: string): boolean {
  return FIRE_ANT_CARRIERS.some(carrier => 
    commodity.toLowerCase().includes(carrier.toLowerCase())
  );
}

export function needsLocationDetail(input: GuidedInput): boolean {
  return input.origin === 'QLD' && 
         isFireAntCarrier(input.commodity) && 
         !input.locationDetail?.suburb && 
         !input.locationDetail?.postcode;
}

export async function fetchRequirements(input: QueryInput): Promise<BackendResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const mockKey = generateMockKey(input);
  
  // Return specific mock response or default
  return MOCK_RESPONSES[mockKey] || MOCK_RESPONSES['general_ask'];
}