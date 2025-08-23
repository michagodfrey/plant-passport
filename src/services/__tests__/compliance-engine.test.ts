import { describe, it, expect, beforeEach } from 'vitest';
import { ComplianceEngine } from '../compliance-engine';
import type {
    ComplianceAnalysisInput,
    ComplianceResult,
} from '@/types/compliance';
import type { Commodity, Pest, PestPresence, ImportRequirement } from '@/types/database';

describe('ComplianceEngine', () => {
    let engine: ComplianceEngine;

    beforeEach(() => {
        engine = new ComplianceEngine();
    });

    const mockCommodity: Commodity = {
        id: 1,
        name: 'Apple',
        type: 'fruit',
    };

    const mockPests: Pest[] = [
        {
            pest_id: 1,
            name: 'Codling Moth',
            acronym: 'CM',
        },
        {
            pest_id: 2,
            name: 'Fire Blight',
            acronym: 'FB',
        },
    ];

    const mockPestPresence: PestPresence[] = [
        {
            pest_id: 1,
            state_id: 2, // NSW
            zoned: false,
        },
        {
            pest_id: 2,
            state_id: 2, // NSW
            zoned: true,
        },
    ];

    const mockImportRequirements: ImportRequirement[] = [
        {
            id: 1,
            name: 'Phytosanitary Certificate',
            description: 'Required phytosanitary certificate for fruit imports',
            source_regulation: 'Biosecurity Act 2015',
        },
        {
            id: 2,
            name: 'Codling Moth Treatment',
            description: 'Specific treatment required for Codling Moth',
            source_regulation: 'Plant Health Regulations',
        },
        {
            id: 3,
            name: 'Fire Blight Inspection',
            description: 'Enhanced inspection for Fire Blight presence',
            source_regulation: 'Emergency Plant Pest Response',
        },
    ];

    describe('analyzeCompliance', () => {
        it('should analyze compliance requirements correctly', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 2, // NSW
                destinationStateId: 6, // Tasmania
                pests: mockPests,
                pestPresence: mockPestPresence,
                importRequirements: mockImportRequirements,
            };

            const result = await engine.analyzeCompliance(input);

            expect(result).toBeDefined();
            expect(result.applicable).toBeDefined();
            expect(result.nonApplicable).toBeDefined();
            expect(result.summary).toBeDefined();
            expect(result.riskAssessment).toBeDefined();
            expect(result.recommendations).toBeDefined();
        });

        it('should identify applicable requirements when pests are present', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 2, // NSW
                destinationStateId: 6, // Tasmania
                pests: mockPests,
                pestPresence: mockPestPresence,
                importRequirements: mockImportRequirements,
            };

            const result = await engine.analyzeCompliance(input);

            // Should have applicable requirements since pests are present
            expect(result.applicable.length).toBeGreaterThan(0);

            // Should identify pest-specific requirements
            const codlingMothReq = result.applicable.find(req =>
                req.requirement.name.includes('Codling Moth')
            );
            expect(codlingMothReq).toBeDefined();
            expect(codlingMothReq?.reason).toContain('present');

            const fireBlight = result.applicable.find(req =>
                req.requirement.name.includes('Fire Blight')
            );
            expect(fireBlight).toBeDefined();
            expect(fireBlight?.riskLevel).toBe('high'); // Should be high risk due to zoned status
        });

        it('should identify non-applicable requirements when pests are absent', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 1, // Different state where pests are not present
                destinationStateId: 6, // Tasmania
                pests: mockPests,
                pestPresence: [], // No pest presence
                importRequirements: mockImportRequirements,
            };

            const result = await engine.analyzeCompliance(input);

            // Should have non-applicable requirements for pest-specific items
            expect(result.nonApplicable.length).toBeGreaterThan(0);

            const nonApplicablePestReqs = result.nonApplicable.filter(req =>
                req.requirement.name.includes('Codling Moth') ||
                req.requirement.name.includes('Fire Blight')
            );
            expect(nonApplicablePestReqs.length).toBeGreaterThan(0);

            // Should indicate waived status
            nonApplicablePestReqs.forEach(req => {
                expect(req.waived).toBe(true);
                expect(req.reason).toMatch(/not present|Not required|Not applicable/i);
            });
        });

        it('should generate correct risk assessment', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 2, // NSW
                destinationStateId: 6, // Tasmania
                pests: mockPests,
                pestPresence: mockPestPresence,
                importRequirements: mockImportRequirements,
            };

            const result = await engine.analyzeCompliance(input);

            expect(result.riskAssessment.pestsTotal).toBe(2);
            expect(result.riskAssessment.pestsPresent).toBe(2);
            expect(result.riskAssessment.zonedPests).toBe(1);
            expect(result.riskAssessment.overallRisk).toBe('high'); // Due to zoned pest
        });

        it('should generate appropriate action items', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 2, // NSW
                destinationStateId: 6, // Tasmania
                pests: mockPests,
                pestPresence: mockPestPresence,
                importRequirements: mockImportRequirements,
            };

            const result = await engine.analyzeCompliance(input);

            const certificateReq = result.applicable.find(req =>
                req.requirement.name.includes('Certificate')
            );
            expect(certificateReq?.actions).toBeDefined();
            expect(certificateReq?.actions.some(action =>
                action.includes('certificate')
            )).toBe(true);

            const treatmentReq = result.applicable.find(req =>
                req.requirement.name.includes('Treatment')
            );
            expect(treatmentReq?.actions).toBeDefined();
            expect(treatmentReq?.actions.some(action =>
                action.includes('treatment')
            )).toBe(true);
        });

        it('should handle empty pest lists', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 2,
                destinationStateId: 6,
                pests: [],
                pestPresence: [],
                importRequirements: [mockImportRequirements[0]], // Only general requirement
            };

            const result = await engine.analyzeCompliance(input);

            expect(result.riskAssessment.overallRisk).toBe('low');
            expect(result.riskAssessment.pestsTotal).toBe(0);
            expect(result.riskAssessment.pestsPresent).toBe(0);
            expect(result.summary).toContain('LOW RISK');
        });

        it('should generate meaningful recommendations', async () => {
            const input: ComplianceAnalysisInput = {
                commodity: mockCommodity,
                originStateId: 2,
                destinationStateId: 6,
                pests: mockPests,
                pestPresence: mockPestPresence,
                importRequirements: mockImportRequirements,
            };

            const result = await engine.analyzeCompliance(input);

            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations.some(rec =>
                rec.includes('zoned pest') || rec.includes('Department of Primary Industries')
            )).toBe(true);
        });
    });

    describe('error handling', () => {
        it('should handle invalid input gracefully', async () => {
            const invalidInput = {
                commodity: mockCommodity,
                originStateId: -1,
                destinationStateId: -1,
                pests: [],
                pestPresence: [],
                importRequirements: [],
            };

            await expect(engine.analyzeCompliance(invalidInput)).resolves.toBeDefined();
        });

        it('should throw error for missing required data in form analysis', async () => {
            const incompleteFormData = {
                destination: { stateId: 6, stateName: 'Tasmania' as const },
            };

            await expect(
                engine.analyzeFromFormData(incompleteFormData as any, [])
            ).rejects.toThrow('Incomplete form data');
        });
    });
});
