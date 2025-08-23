import { useMemo } from 'react';
import { StepManager } from './StepManager';
import { CommodityStep } from './CommodityStep';
import { OriginStep } from './OriginStep';
import { PestAnalysisStep } from './PestAnalysisStep';
import { ComplianceResultsStep } from './ComplianceResultsStep';
import type { FormStep, FormStepData, StepManagerProps } from '@/types/form-steps';
import type { GuidedInput } from '@/types/plant-passport';

interface DynamicGuidedFormProps {
  onSubmit: (input: GuidedInput) => void;
  isLoading?: boolean;
}

export function DynamicGuidedForm({ onSubmit, isLoading }: DynamicGuidedFormProps) {
  const steps: FormStep[] = useMemo(() => [
    {
      id: 'commodity',
      title: 'Select Commodity',
      description: 'Tell us what you\'re moving so we can identify relevant pests and requirements.',
      component: CommodityStep,
      isComplete: (data: FormStepData) => !!data.commodity,
      canProceed: (data: FormStepData) => !!data.commodity,
    },
    {
      id: 'origin',
      title: 'Select Origin State',
      description: 'Select your origin state to determine pest presence and compliance requirements.',
      component: OriginStep,
      isComplete: (data: FormStepData) => !!data.origin,
      canProceed: (data: FormStepData) => !!data.origin,
    },
    {
      id: 'pest-analysis',
      title: 'Pest Risk Analysis',
      description: 'Review the pests associated with your commodity and their presence in your origin state.',
      component: PestAnalysisStep,
      isComplete: (data: FormStepData) => !!data.pests && !!data.pestPresence,
      canProceed: (data: FormStepData) => !!data.pests,
    },
    {
      id: 'compliance-results',
      title: 'Compliance Requirements',
      description: 'Review the applicable requirements and recommendations for your plant shipment.',
      component: ComplianceResultsStep,
      isComplete: (data: FormStepData) => !!data.complianceResult,
      canProceed: (data: FormStepData) => !!data.complianceResult,
    },
  ], []);

  const handleComplete = (data: FormStepData) => {
    if (!data.commodity || !data.origin || !data.pests || !data.complianceResult) {
      console.error('Incomplete form data:', data);
      return;
    }

    // Convert FormStepData to GuidedInput format
    const guidedInput: GuidedInput = {
      commodity: data.commodity.name,
      origin: mapStateIdToAbbreviation(data.origin.stateId),
      destination: 'TAS', // Fixed to Tasmania for POC
    };

    onSubmit(guidedInput);
  };

  return (
    <StepManager
      steps={steps}
      onComplete={handleComplete}
      isLoading={isLoading}
    />
  );
}

// Helper function to map state ID back to abbreviation
function mapStateIdToAbbreviation(stateId: number): 'QLD' | 'NSW' | 'VIC' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT' {
  const stateMap: Record<number, 'QLD' | 'NSW' | 'VIC' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT'> = {
    1: 'QLD',
    2: 'NSW', 
    3: 'VIC',
    4: 'SA',
    5: 'WA',
    6: 'NT',
    7: 'TAS',
    8: 'ACT',
  };
  return stateMap[stateId] || 'TAS';
}
