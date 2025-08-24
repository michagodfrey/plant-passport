import { supabase } from '@/config/supabase';
import type { ComplianceResult, ApplicableRequirement, NonApplicableRequirement } from '@/types/compliance';

export interface ComplianceSummaryRequest {
    commodity: string;
    origin: string;
    destination: string;
    applicableRequirements: ApplicableRequirement[];
    nonApplicableRequirements: NonApplicableRequirement[];
    pestContext: {
        identifiedPests: Array<{
            pest_id: number;
            name: string;
            acronym: string;
        }>;
        pestsPresent: Array<{
            pest_id: number;
            name: string;
            acronym: string;
        }>;
        pestsAbsent: Array<{
            pest_id: number;
            name: string;
            acronym: string;
        }>;
    };
}

export interface LLMServiceResponse {
    summary: string;
    success: boolean;
    error?: string;
}

export class LLMService {
    private static readonly TIMEOUT_MS = 15000; // 15 seconds
    private static readonly EDGE_FUNCTION_NAME = 'compliance-summarization';

    /**
     * Check if the LLM service is available
     */
    static isAvailable(): boolean {
        // Check if we have the necessary Supabase configuration
        return !!(supabase && supabase.functions);
    }

    /**
     * Generate a compliance summary using the Supabase Edge Function
     */
    static async generateComplianceSummary(
        complianceResult: ComplianceResult,
        formData: {
            commodity?: { name: string; type: string };
            origin?: { stateName: string };
            destination: { stateName: string };
            pests?: Array<{ pest_id: number; name: string; acronym: string }>;
            pestPresence?: Array<{ pest_id: number; state_id: number; zoned: boolean }>;
        }
    ): Promise<LLMServiceResponse> {
        try {
            // Validate inputs
            if (!this.isAvailable()) {
                return {
                    summary: '',
                    success: false,
                    error: 'LLM service is not available'
                };
            }

            // Debug: Log form data structure
            console.log('LLM Service: Form data received:', {
                commodity: formData.commodity ? 'present' : 'missing',
                origin: formData.origin ? 'present' : 'missing',
                destination: formData.destination ? 'present' : 'missing',
                pests: formData.pests ? `${formData.pests.length} items` : 'missing',
                pestPresence: formData.pestPresence ? `${formData.pestPresence.length} items` : 'missing'
            });

            if (!formData.commodity || !formData.origin) {
                console.error('LLM Service: Missing required form data', {
                    commodity: !!formData.commodity,
                    origin: !!formData.origin
                });
                return {
                    summary: '',
                    success: false,
                    error: 'Missing required form data'
                };
            }

            // Prepare pest context
            const identifiedPests = formData.pests || [];
            const pestPresenceMap = new Map(
                (formData.pestPresence || []).map(pp => [pp.pest_id, pp])
            );

            const pestsPresent = identifiedPests.filter(pest =>
                pestPresenceMap.has(pest.pest_id)
            );

            const pestsAbsent = identifiedPests.filter(pest =>
                !pestPresenceMap.has(pest.pest_id)
            );

            // Prepare request payload
            const requestPayload: ComplianceSummaryRequest = {
                commodity: `${formData.commodity.name} (${formData.commodity.type})`,
                origin: formData.origin.stateName,
                destination: formData.destination.stateName,
                applicableRequirements: complianceResult.applicable || [],
                nonApplicableRequirements: complianceResult.nonApplicable || [],
                pestContext: {
                    identifiedPests,
                    pestsPresent,
                    pestsAbsent
                }
            };

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT_MS);
            });

            // Debug: Log request payload
            console.log('LLM Service: Making request to Edge Function');
            console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

            // Make request to Edge Function with timeout
            const requestPromise = supabase.functions.invoke(this.EDGE_FUNCTION_NAME, {
                body: requestPayload,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { data, error } = await Promise.race([requestPromise, timeoutPromise]);

            if (error) {
                console.error('Edge Function error:', error);
                return {
                    summary: '',
                    success: false,
                    error: `Failed to generate summary: ${error.message}`
                };
            }

            if (!data || typeof data.summary !== 'string') {
                return {
                    summary: '',
                    success: false,
                    error: 'Invalid response from summarization service'
                };
            }

            return {
                summary: data.summary,
                success: true
            };

        } catch (error) {
            console.error('LLM Service error:', error);

            // Handle specific error types
            if (error instanceof Error) {
                if (error.message === 'Request timeout') {
                    return {
                        summary: '',
                        success: false,
                        error: 'Request timed out. Please try again.'
                    };
                }

                return {
                    summary: '',
                    success: false,
                    error: `Service error: ${error.message}`
                };
            }

            return {
                summary: '',
                success: false,
                error: 'An unexpected error occurred'
            };
        }
    }

    /**
     * Generate a fallback summary when LLM service is unavailable
     */
    static generateFallbackSummary(
        complianceResult: ComplianceResult,
        formData: {
            commodity?: { name: string; type: string };
            origin?: { stateName: string };
            destination: { stateName: string };
        }
    ): string {
        const applicableCount = complianceResult.applicable?.length || 0;
        const nonApplicableCount = complianceResult.nonApplicable?.length || 0;

        if (applicableCount === 0) {
            return `No specific import requirements found for ${formData.commodity?.name || 'this commodity'} from ${formData.origin?.stateName || 'your origin'} to ${formData.destination.stateName}. General biosecurity regulations may still apply.`;
        }

        if (applicableCount === 1) {
            return `1 import requirement applies for ${formData.commodity?.name || 'this commodity'} from ${formData.origin?.stateName || 'your origin'} to ${formData.destination.stateName}. Please review the requirement details below.`;
        }

        return `${applicableCount} import requirements apply for ${formData.commodity?.name || 'this commodity'} from ${formData.origin?.stateName || 'your origin'} to ${formData.destination.stateName}. Please review all requirement details below.`;
    }
}

export default LLMService;
