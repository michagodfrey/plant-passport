// Service layer exports for easy importing

export { SupabaseService, supabaseService } from './supabase';
export { ValidationService, validationService } from './validation';
export { ComplianceEngine, complianceEngine } from './compliance-engine';
export { supabase } from '../config/supabase';

// Re-export types for convenience
export type {
    Commodity,
    Pest,
    PestPresence,
    ImportRequirement,
    State,
    CommodityPest,
    CommodityImportRequirement,
    CommodityWithPests,
    PestWithPresence,
    ImportRequirementWithDetails,
    DatabaseConfig,
} from '../types/database';

export type { ValidationResult } from './validation';

export type {
    ComplianceAnalysisInput,
    ComplianceResult,
    ApplicableRequirement,
    NonApplicableRequirement,
    RiskAssessment,
    ComplianceEngineConfig,
} from '../types/compliance';
