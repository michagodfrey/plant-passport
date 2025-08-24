import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComplianceResult } from '@/types/compliance';

// Mock Supabase
vi.mock('@/config/supabase', () => ({
    supabase: {
        functions: {
            invoke: vi.fn()
        }
    }
}));

import { LLMService } from '../llm-service';
import { supabase } from '@/config/supabase';

describe('LLMService', () => {
    const mockInvoke = supabase.functions.invoke as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isAvailable', () => {
        it('should return true when supabase functions are available', () => {
            expect(LLMService.isAvailable()).toBe(true);
        });
    });

    describe('generateComplianceSummary', () => {
        const mockComplianceResult: ComplianceResult = {
            applicable: [
                {
                    requirement: {
                        id: 1,
                        name: 'Test Requirement',
                        description: 'Test description',
                        regulation_reference: 'REG-001',
                        state_id: 1,
                        created_at: '2024-01-01',
                        updated_at: '2024-01-01'
                    },
                    reason: 'Test reason',
                    source: 'Test source',
                    actions: ['Test action'],
                    riskLevel: 'medium' as const
                }
            ],
            nonApplicable: [],
            riskAssessment: {
                overallRisk: 'medium' as const,
                pestsPresent: 1,
                pestsTotal: 2,
                zonedPests: 0,
                requirementsCount: 1
            },
            recommendations: ['Test recommendation']
        };

        const mockFormData = {
            commodity: { name: 'Apple', type: 'fruit' },
            origin: { stateName: 'Victoria' },
            destination: { stateName: 'Tasmania' },
            pests: [
                { pest_id: 1, name: 'Test Pest', acronym: 'TP' }
            ],
            pestPresence: [
                { pest_id: 1, state_id: 1, zoned: false }
            ]
        };

        it('should successfully generate a summary', async () => {
            mockInvoke.mockResolvedValue({
                data: { summary: 'Test AI summary' },
                error: null
            });

            const result = await LLMService.generateComplianceSummary(mockComplianceResult, mockFormData);

            expect(result.success).toBe(true);
            expect(result.summary).toBe('Test AI summary');
            expect(result.error).toBeUndefined();
            expect(mockInvoke).toHaveBeenCalledWith('compliance-summarization', {
                body: expect.objectContaining({
                    commodity: 'Apple (fruit)',
                    origin: 'Victoria',
                    destination: 'Tasmania'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        it('should handle Edge Function errors', async () => {
            mockInvoke.mockResolvedValue({
                data: null,
                error: { message: 'Function error' }
            });

            const result = await LLMService.generateComplianceSummary(mockComplianceResult, mockFormData);

            expect(result.success).toBe(false);
            expect(result.summary).toBe('');
            expect(result.error).toBe('Failed to generate summary: Function error');
        });

        it('should handle invalid response data', async () => {
            mockInvoke.mockResolvedValue({
                data: { invalid: 'response' },
                error: null
            });

            const result = await LLMService.generateComplianceSummary(mockComplianceResult, mockFormData);

            expect(result.success).toBe(false);
            expect(result.summary).toBe('');
            expect(result.error).toBe('Invalid response from summarization service');
        });

        it('should handle missing form data', async () => {
            const incompleteFormData = {
                destination: { stateName: 'Tasmania' }
            };

            const result = await LLMService.generateComplianceSummary(
                mockComplianceResult,
                incompleteFormData as any
            );

            expect(result.success).toBe(false);
            expect(result.summary).toBe('');
            expect(result.error).toBe('Missing required form data');
        });
    });

    describe('generateFallbackSummary', () => {
        const mockFormData = {
            commodity: { name: 'Apple', type: 'fruit' },
            origin: { stateName: 'Victoria' },
            destination: { stateName: 'Tasmania' }
        };

        it('should generate fallback summary for no requirements', () => {
            const complianceResult: ComplianceResult = {
                applicable: [],
                nonApplicable: [],
                riskAssessment: {
                    overallRisk: 'low',
                    pestsPresent: 0,
                    pestsTotal: 0,
                    zonedPests: 0,
                    requirementsCount: 0
                },
                recommendations: []
            };

            const summary = LLMService.generateFallbackSummary(complianceResult, mockFormData);

            expect(summary).toContain('No specific import requirements found');
            expect(summary).toContain('Apple');
            expect(summary).toContain('Victoria');
            expect(summary).toContain('Tasmania');
        });

        it('should generate fallback summary for single requirement', () => {
            const complianceResult: ComplianceResult = {
                applicable: [
                    {
                        requirement: {
                            id: 1,
                            name: 'Test Requirement',
                            description: 'Test description',
                            regulation_reference: 'REG-001',
                            state_id: 1,
                            created_at: '2024-01-01',
                            updated_at: '2024-01-01'
                        },
                        reason: 'Test reason',
                        source: 'Test source',
                        actions: ['Test action'],
                        riskLevel: 'medium'
                    }
                ],
                nonApplicable: [],
                riskAssessment: {
                    overallRisk: 'medium',
                    pestsPresent: 1,
                    pestsTotal: 1,
                    zonedPests: 0,
                    requirementsCount: 1
                },
                recommendations: []
            };

            const summary = LLMService.generateFallbackSummary(complianceResult, mockFormData);

            expect(summary).toContain('1 import requirement applies');
            expect(summary).toContain('Apple');
        });

        it('should generate fallback summary for multiple requirements', () => {
            const complianceResult: ComplianceResult = {
                applicable: [
                    {
                        requirement: {
                            id: 1,
                            name: 'Test Requirement 1',
                            description: 'Test description 1',
                            regulation_reference: 'REG-001',
                            state_id: 1,
                            created_at: '2024-01-01',
                            updated_at: '2024-01-01'
                        },
                        reason: 'Test reason 1',
                        source: 'Test source 1',
                        actions: ['Test action 1'],
                        riskLevel: 'medium'
                    },
                    {
                        requirement: {
                            id: 2,
                            name: 'Test Requirement 2',
                            description: 'Test description 2',
                            regulation_reference: 'REG-002',
                            state_id: 1,
                            created_at: '2024-01-01',
                            updated_at: '2024-01-01'
                        },
                        reason: 'Test reason 2',
                        source: 'Test source 2',
                        actions: ['Test action 2'],
                        riskLevel: 'high'
                    }
                ],
                nonApplicable: [],
                riskAssessment: {
                    overallRisk: 'high',
                    pestsPresent: 2,
                    pestsTotal: 2,
                    zonedPests: 1,
                    requirementsCount: 2
                },
                recommendations: []
            };

            const summary = LLMService.generateFallbackSummary(complianceResult, mockFormData);

            expect(summary).toContain('2 import requirements apply');
            expect(summary).toContain('Apple');
        });
    });
});
