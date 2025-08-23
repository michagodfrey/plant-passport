import type {
    ComplianceAnalysisInput,
    ComplianceResult,
    ApplicableRequirement,
    NonApplicableRequirement,
    RiskAssessment,
    ComplianceEngineConfig,
} from '@/types/compliance';
import type { FormStepData } from '@/types/form-steps';
import type { ImportRequirement, Pest, PestPresence } from '@/types/database';

export class ComplianceEngine {
    private config: ComplianceEngineConfig;

    constructor(config?: Partial<ComplianceEngineConfig>) {
        this.config = {
            defaultDestinationState: 'Tasmania',
            riskThresholds: {
                lowRisk: 0.3,
                mediumRisk: 0.7,
            },
            ...config,
        };
    }

    /**
     * Main method to analyze compliance requirements
     */
    async analyzeCompliance(input: ComplianceAnalysisInput): Promise<ComplianceResult> {
        try {
            // Determine which pests are present in the origin state
            const pestsInOrigin = this.getPestsInOrigin(input.pests, input.pestPresence, input.originStateId);

            // Analyze applicable requirements
            const applicable = this.determineApplicableRequirements(
                input.commodity,
                input.pests,
                pestsInOrigin,
                input.importRequirements
            );

            // Analyze non-applicable requirements
            const nonApplicable = this.determineNonApplicableRequirements(
                input.importRequirements,
                applicable,
                pestsInOrigin
            );

            // Generate risk assessment
            const riskAssessment = this.generateRiskAssessment(
                input.pests,
                pestsInOrigin,
                applicable
            );

            // Generate summary and recommendations
            const summary = this.generateSummary(applicable, nonApplicable, riskAssessment);
            const recommendations = this.generateRecommendations(applicable, riskAssessment);

            return {
                applicable,
                nonApplicable,
                summary,
                riskAssessment,
                recommendations,
            };
        } catch (error) {
            console.error('Error in compliance analysis:', error);
            throw new Error(`Compliance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Determine which requirements are applicable based on pest presence and commodity type
     */
    private determineApplicableRequirements(
        commodity: { id: number; name: string; type: string },
        pests: Pest[],
        pestsInOrigin: Array<{ pest: Pest; presence: PestPresence }>,
        requirements: ImportRequirement[]
    ): ApplicableRequirement[] {
        const applicable: ApplicableRequirement[] = [];

        for (const requirement of requirements) {
            // Check if requirement applies based on pest presence
            const applicabilityResult = this.checkRequirementApplicability(
                requirement,
                commodity,
                pests,
                pestsInOrigin
            );

            if (applicabilityResult.isApplicable) {
                applicable.push({
                    requirement,
                    reason: applicabilityResult.reason,
                    source: requirement.source_regulation || 'Biosecurity regulations',
                    actions: this.generateActionItems(requirement, applicabilityResult.riskLevel),
                    riskLevel: applicabilityResult.riskLevel,
                });
            }
        }

        return applicable;
    }

    /**
     * Determine which requirements are not applicable and why
     */
    private determineNonApplicableRequirements(
        allRequirements: ImportRequirement[],
        applicableRequirements: ApplicableRequirement[],
        pestsInOrigin: Array<{ pest: Pest; presence: PestPresence }>
    ): NonApplicableRequirement[] {
        const applicableIds = new Set(applicableRequirements.map(req => req.requirement.id));
        const nonApplicable: NonApplicableRequirement[] = [];

        for (const requirement of allRequirements) {
            if (!applicableIds.has(requirement.id)) {
                const reason = this.determineNonApplicabilityReason(requirement, pestsInOrigin);
                const waived = reason.includes('not present') ||
                    reason.includes('absent') ||
                    reason.includes('Not applicable') ||
                    reason.includes('Not required');
                nonApplicable.push({
                    requirement,
                    reason,
                    waived,
                });
            }
        }

        return nonApplicable;
    }

    /**
     * Check if a specific requirement applies to the current scenario
     */
    private checkRequirementApplicability(
        requirement: ImportRequirement,
        commodity: { id: number; name: string; type: string },
        pests: Pest[],
        pestsInOrigin: Array<{ pest: Pest; presence: PestPresence }>
    ): { isApplicable: boolean; reason: string; riskLevel: 'low' | 'medium' | 'high' } {
        // Default to applicable unless we can determine otherwise
        let isApplicable = true;
        let reason = `Required for ${commodity.name} imports to Tasmania`;
        let riskLevel: 'low' | 'medium' | 'high' = 'medium';

        // Check if requirement is pest-specific
        const requirementName = requirement.name.toLowerCase();
        const requirementDesc = requirement.description.toLowerCase();

        // Look for pest-specific requirements
        const relevantPests = pests.filter(pest =>
            requirementName.includes(pest.name.toLowerCase()) ||
            requirementName.includes(pest.acronym.toLowerCase()) ||
            requirementDesc.includes(pest.name.toLowerCase()) ||
            requirementDesc.includes(pest.acronym.toLowerCase())
        );

        if (relevantPests.length > 0) {
            // This is a pest-specific requirement
            const pestPresentInOrigin = relevantPests.some(pest =>
                pestsInOrigin.some(p => p.pest.pest_id === pest.pest_id)
            );

            if (!pestPresentInOrigin) {
                isApplicable = false;
                reason = `Not required - ${relevantPests.map(p => p.name).join(', ')} not present in origin state`;
            } else {
                // Check if any of the pests are zoned
                const zonedPests = pestsInOrigin.filter(p =>
                    relevantPests.some(rp => rp.pest_id === p.pest.pest_id) && p.presence.zoned
                );

                if (zonedPests.length > 0) {
                    riskLevel = 'high';
                    reason = `Required - ${zonedPests.map(p => p.pest.name).join(', ')} present and zoned in origin state`;
                } else {
                    riskLevel = 'medium';
                    reason = `Required - ${relevantPests.map(p => p.name).join(', ')} present in origin state`;
                }
            }
        } else {
            // General requirement - check overall risk level
            const totalPestsPresent = pestsInOrigin.length;
            const totalPests = pests.length;
            const zonedPestsPresent = pestsInOrigin.filter(p => p.presence.zoned).length;

            if (totalPests === 0) {
                riskLevel = 'low';
                reason = `Standard requirement for ${commodity.name} - no specific pest risks identified`;
            } else if (totalPestsPresent === 0) {
                riskLevel = 'low';
                reason = `Standard requirement for ${commodity.name} - no associated pests present in origin state`;
            } else if (zonedPestsPresent > 0) {
                riskLevel = 'high';
                reason = `Required - ${zonedPestsPresent} zoned pest(s) present in origin state`;
            } else {
                riskLevel = 'medium';
                reason = `Required - ${totalPestsPresent} of ${totalPests} associated pests present in origin state`;
            }
        }

        return { isApplicable, reason, riskLevel };
    }

    /**
     * Determine why a requirement is not applicable
     */
    private determineNonApplicabilityReason(
        requirement: ImportRequirement,
        pestsInOrigin: Array<{ pest: Pest; presence: PestPresence }>
    ): string {
        const requirementName = requirement.name.toLowerCase();
        const requirementDesc = requirement.description.toLowerCase();

        // Check if this is a pest-specific requirement that doesn't apply
        if (requirementName.includes('pest') || requirementDesc.includes('pest')) {
            return 'Not applicable - associated pests not present in origin state';
        }

        // Check for specific treatment requirements
        if (requirementName.includes('treatment') || requirementDesc.includes('treatment')) {
            return 'Not required - no pest risk identified that requires this treatment';
        }

        // Check for inspection requirements
        if (requirementName.includes('inspection') || requirementDesc.includes('inspection')) {
            return 'Not applicable - specific enhanced inspection not required';
        }

        // Check for specific pest names in requirement
        const pestNames = ['codling moth', 'fire blight', 'moth', 'blight'];
        const hasPestReference = pestNames.some(pestName =>
            requirementName.includes(pestName) || requirementDesc.includes(pestName)
        );

        if (hasPestReference) {
            return 'Not applicable - associated pests not present in origin state';
        }

        // Default reason
        return 'Not applicable based on current commodity and origin state combination';
    }

    /**
     * Generate action items for a requirement
     */
    private generateActionItems(
        requirement: ImportRequirement,
        riskLevel: 'low' | 'medium' | 'high'
    ): string[] {
        const actions: string[] = [];
        const name = requirement.name.toLowerCase();
        const description = requirement.description.toLowerCase();

        // Add specific actions based on requirement type
        if (name.includes('certificate') || description.includes('certificate')) {
            actions.push('Obtain required phytosanitary certificate from origin state');
        }

        if (name.includes('inspection') || description.includes('inspection')) {
            actions.push('Arrange for inspection by authorized personnel');
            if (riskLevel === 'high') {
                actions.push('Ensure plants are accessible for detailed inspection');
            }
        }

        if (name.includes('treatment') || description.includes('treatment')) {
            actions.push('Apply required treatment as specified in regulations');
            actions.push('Maintain treatment records and certificates');
        }

        if (name.includes('permit') || description.includes('permit')) {
            actions.push('Apply for import permit before shipment');
        }

        if (name.includes('quarantine') || description.includes('quarantine')) {
            actions.push('Prepare for quarantine period if required');
            actions.push('Ensure compliance with quarantine facility requirements');
        }

        // Add general actions if no specific ones identified
        if (actions.length === 0) {
            actions.push('Review requirement details and ensure compliance');
            actions.push('Contact relevant authorities for specific guidance');
        }

        // Add risk-level specific actions
        if (riskLevel === 'high') {
            actions.push('Priority compliance - high biosecurity risk identified');
        }

        return actions;
    }

    /**
     * Get pests that are present in the origin state
     */
    private getPestsInOrigin(
        pests: Pest[],
        pestPresence: PestPresence[],
        originStateId: number
    ): Array<{ pest: Pest; presence: PestPresence }> {
        const pestsInOrigin: Array<{ pest: Pest; presence: PestPresence }> = [];

        for (const pest of pests) {
            const presence = pestPresence.find(
                p => p.pest_id === pest.pest_id && p.state_id === originStateId
            );

            if (presence) {
                pestsInOrigin.push({ pest, presence });
            }
        }

        return pestsInOrigin;
    }

    /**
     * Generate risk assessment
     */
    private generateRiskAssessment(
        allPests: Pest[],
        pestsInOrigin: Array<{ pest: Pest; presence: PestPresence }>,
        applicableRequirements: ApplicableRequirement[]
    ): RiskAssessment {
        const pestsPresent = pestsInOrigin.length;
        const pestsTotal = allPests.length;
        const zonedPests = pestsInOrigin.filter(p => p.presence.zoned).length;
        const requirementsCount = applicableRequirements.length;

        // Calculate overall risk
        let overallRisk: 'low' | 'medium' | 'high' = 'low';

        if (zonedPests > 0) {
            overallRisk = 'high';
        } else if (pestsTotal > 0) {
            const riskRatio = pestsPresent / pestsTotal;
            if (riskRatio >= this.config.riskThresholds.mediumRisk) {
                overallRisk = 'medium';
            } else if (riskRatio >= this.config.riskThresholds.lowRisk) {
                overallRisk = 'low';
            }
        }

        // Adjust based on number of requirements
        if (requirementsCount > 5 && overallRisk === 'low') {
            overallRisk = 'medium';
        }

        return {
            overallRisk,
            pestsPresent,
            pestsTotal,
            zonedPests,
            requirementsCount,
        };
    }

    /**
     * Generate summary text
     */
    private generateSummary(
        applicable: ApplicableRequirement[],
        nonApplicable: NonApplicableRequirement[],
        riskAssessment: RiskAssessment
    ): string {
        const { overallRisk, pestsPresent, pestsTotal, zonedPests, requirementsCount } = riskAssessment;

        let summary = `Compliance analysis complete. `;

        // Risk level summary
        if (overallRisk === 'high') {
            summary += `HIGH RISK: ${zonedPests} zoned pest(s) present in origin state. `;
        } else if (overallRisk === 'medium') {
            summary += `MEDIUM RISK: ${pestsPresent} of ${pestsTotal} associated pests present in origin state. `;
        } else {
            summary += `LOW RISK: Minimal pest risk identified. `;
        }

        // Requirements summary
        summary += `${requirementsCount} requirement(s) apply to this shipment. `;

        if (nonApplicable.length > 0) {
            const waivedCount = nonApplicable.filter(r => r.waived).length;
            if (waivedCount > 0) {
                summary += `${waivedCount} requirement(s) waived due to absence of pest risk. `;
            }
        }

        return summary;
    }

    /**
     * Generate recommendations
     */
    private generateRecommendations(
        applicable: ApplicableRequirement[],
        riskAssessment: RiskAssessment
    ): string[] {
        const recommendations: string[] = [];

        if (riskAssessment.overallRisk === 'high') {
            recommendations.push('Contact Tasmania Department of Primary Industries for pre-clearance guidance');
            recommendations.push('Consider additional treatments or certifications to reduce risk');
        }

        if (applicable.length === 0) {
            recommendations.push('Verify with local authorities that no additional requirements apply');
            recommendations.push('Maintain standard documentation for interstate plant movement');
        } else {
            recommendations.push('Complete all applicable requirements before shipment');
            recommendations.push('Keep all certificates and documentation readily available');
        }

        if (riskAssessment.zonedPests > 0) {
            recommendations.push('Pay special attention to zoned pest requirements - these are strictly enforced');
        }

        recommendations.push('Check for any recent regulatory updates before shipping');

        return recommendations;
    }

    /**
     * Analyze compliance from form data
     */
    async analyzeFromFormData(
        formData: FormStepData,
        importRequirements: ImportRequirement[]
    ): Promise<ComplianceResult> {
        if (!formData.commodity || !formData.origin || !formData.pests || !formData.pestPresence) {
            throw new Error('Incomplete form data for compliance analysis');
        }

        const input: ComplianceAnalysisInput = {
            commodity: formData.commodity,
            originStateId: formData.origin.stateId,
            destinationStateId: formData.destination.stateId,
            pests: formData.pests,
            pestPresence: formData.pestPresence,
            importRequirements,
        };

        return this.analyzeCompliance(input);
    }
}

// Export singleton instance
export const complianceEngine = new ComplianceEngine();
export default complianceEngine;
