# Compliance Engine Integration

## Overview

The compliance engine has been successfully integrated into the dynamic guided form workflow. Users now go through a 4-step process that culminates in a comprehensive compliance analysis.

## Workflow Steps

1. **Commodity Selection** - User selects their plant commodity
2. **Origin State Selection** - User selects their origin state
3. **Pest Analysis** - System analyzes pests associated with the commodity and their presence in the origin state
4. **Compliance Requirements** - System analyzes and displays applicable requirements, risk assessment, and recommendations

## Key Components

### ComplianceEngine (`src/services/compliance-engine.ts`)
- Core service that analyzes compliance requirements
- Determines applicable vs non-applicable requirements based on pest presence
- Generates risk assessments and actionable recommendations
- Provides detailed explanations for each requirement

### ComplianceResultsStep (`src/components/ComplianceResultsStep.tsx`)
- UI component that displays compliance analysis results
- Shows applicable requirements with action items
- Displays non-applicable requirements with explanations
- Provides risk assessment summary and recommendations
- Integrates with the form step workflow

### Integration Points

#### Form Data Flow
```typescript
FormStepData {
  commodity?: Commodity;
  origin?: OriginState;
  pests?: Pest[];
  pestPresence?: PestPresence[];
  complianceResult?: ComplianceResult; // Added for compliance integration
}
```

#### Step Configuration
The compliance step is configured in `DynamicGuidedForm.tsx`:
```typescript
{
  id: 'compliance-results',
  title: 'Compliance Requirements',
  description: 'Review the applicable requirements and recommendations for your plant shipment.',
  component: ComplianceResultsStep,
  isComplete: (data) => !!data.complianceResult,
  canProceed: (data) => !!data.complianceResult,
}
```

## Features

### Smart Requirement Analysis
- **Pest-Specific Requirements**: Automatically identifies requirements that apply only when specific pests are present
- **Risk-Based Assessment**: Calculates risk levels (low/medium/high) based on pest presence and zoning status
- **Contextual Explanations**: Provides clear reasons why each requirement applies or doesn't apply

### User Experience
- **Progressive Disclosure**: Uses collapsible sections to organize information
- **Visual Risk Indicators**: Color-coded badges and icons for different risk levels
- **Actionable Guidance**: Specific action items for each applicable requirement
- **Comprehensive Summary**: Overview of risk assessment with key metrics

### Data Persistence
- Compliance results are stored in the form data for the session
- Results persist when navigating between form steps
- Analysis is cached to avoid re-computation on step navigation

## Testing

The compliance engine includes comprehensive tests covering:
- Applicable requirement determination
- Non-applicable requirement identification
- Risk assessment calculation
- Action item generation
- Error handling scenarios

Run tests with:
```bash
npm test src/services/__tests__/compliance-engine.test.ts
```

## Usage Example

The compliance engine is automatically triggered when users complete the pest analysis step. It:

1. Fetches import requirements for the selected commodity
2. Analyzes which requirements apply based on pest presence in the origin state
3. Generates risk assessment and recommendations
4. Displays results in an organized, user-friendly format

Users can then proceed to complete their compliance analysis or go back to modify their selections if needed.
