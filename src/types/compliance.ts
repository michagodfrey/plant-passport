// Compliance engine types for requirement analysis

import type { ImportRequirement, Pest, PestPresence, Commodity } from './database';
import type { FormStepData } from './form-steps';

export interface ComplianceAnalysisInput {
    commodity: Commodity;
    originStateId: number;
    destinationStateId: number;
    pests: Pest[];
    pestPresence: PestPresence[];
    importRequirements: ImportRequirement[];
}

export interface ApplicableRequirement {
    requirement: ImportRequirement;
    reason: string;
    source: string;
    actions: string[];
    riskLevel: 'low' | 'medium' | 'high';
}

export interface NonApplicableRequirement {
    requirement: ImportRequirement;
    reason: string;
    waived: boolean;
}

export interface ComplianceResult {
    applicable: ApplicableRequirement[];
    nonApplicable: NonApplicableRequirement[];
    summary: string;
    riskAssessment: RiskAssessment;
    recommendations: string[];
}

export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high';
    pestsPresent: number;
    pestsTotal: number;
    zonedPests: number;
    requirementsCount: number;
}

export interface ComplianceEngineConfig {
    defaultDestinationState: string;
    riskThresholds: {
        lowRisk: number;
        mediumRisk: number;
    };
}
