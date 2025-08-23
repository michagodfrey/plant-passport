// Form step management types for dynamic guided form

import type { Commodity, State, Pest, PestPresence } from './database';
import type { ComplianceResult } from './compliance';

export interface FormStepData {
    commodity?: {
        id: number;
        name: string;
        type: string;
    };
    origin?: {
        stateId: number;
        stateName: string;
    };
    destination: {
        stateId: number; // Fixed to Tasmania for POC
        stateName: "Tasmania";
    };
    pests?: Pest[];
    pestPresence?: PestPresence[];
    complianceResult?: ComplianceResult;
}

export interface FormStep {
    id: string;
    title: string;
    description: string;
    component: React.ComponentType<FormStepProps>;
    isComplete: (data: FormStepData) => boolean;
    canProceed: (data: FormStepData) => boolean;
}

export interface FormStepProps {
    data: FormStepData;
    onDataChange: (updates: Partial<FormStepData>) => void;
    onNext: () => void;
    onPrevious: () => void;
    isLoading?: boolean;
    error?: string;
}

export interface StepManagerProps {
    steps: FormStep[];
    initialData?: Partial<FormStepData>;
    onComplete: (data: FormStepData) => void;
    isLoading?: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

export interface CommoditySearchResult {
    commodities: Commodity[];
    hasMultipleTypes: boolean;
    needsDisambiguation: boolean;
}
