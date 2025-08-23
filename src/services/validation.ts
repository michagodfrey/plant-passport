import { supabaseService } from './supabase';
import type { Commodity, State } from '@/types/database';

export interface ValidationResult {
    isValid: boolean;
    message?: string;
    suggestions?: string[];
    data?: any;
}

export class ValidationService {
    /**
     * Validate commodity input against database
     */
    async validateCommodity(input: string): Promise<ValidationResult> {
        try {
            if (!input || input.trim().length === 0) {
                return {
                    isValid: false,
                    message: 'Commodity name is required',
                };
            }

            const commodities = await supabaseService.searchCommodities(input.trim());

            if (commodities.length === 0) {
                // Try partial matches for suggestions
                const partialMatches = await supabaseService.searchCommodities(input.trim().substring(0, 3));
                const suggestions = partialMatches.slice(0, 5).map(c => c.name);

                return {
                    isValid: false,
                    message: 'No matching commodity found',
                    suggestions,
                };
            }

            // Exact match found
            const exactMatch = commodities.find(c =>
                c.name.toLowerCase() === input.trim().toLowerCase()
            );

            if (exactMatch) {
                return {
                    isValid: true,
                    message: 'Commodity validated',
                    data: exactMatch,
                };
            }

            // Multiple partial matches - need disambiguation
            if (commodities.length > 1) {
                return {
                    isValid: false,
                    message: 'Multiple commodities found. Please select the specific type:',
                    suggestions: commodities.map(c => c.name),
                    data: commodities,
                };
            }

            // Single partial match
            return {
                isValid: true,
                message: 'Commodity found',
                data: commodities[0],
            };
        } catch (error) {
            console.error('Error validating commodity:', error);
            return {
                isValid: false,
                message: 'Error validating commodity. Please try again.',
            };
        }
    }

    /**
     * Enhanced commodity validation with disambiguation support
     */
    async validateCommodityWithDisambiguation(input: string): Promise<ValidationResult & {
        needsDisambiguation?: boolean;
        alternatives?: Commodity[];
    }> {
        try {
            if (!input || input.trim().length === 0) {
                return {
                    isValid: false,
                    message: 'Commodity name is required',
                };
            }

            const commodities = await supabaseService.searchCommodities(input.trim());

            if (commodities.length === 0) {
                // Try broader search for suggestions
                const broaderSearch = input.trim().length > 3
                    ? await supabaseService.searchCommodities(input.trim().substring(0, 3))
                    : [];

                const suggestions = broaderSearch.slice(0, 5).map(c => c.name);

                return {
                    isValid: false,
                    message: 'No matching commodity found',
                    suggestions,
                };
            }

            // Check for exact match
            const exactMatch = commodities.find(c =>
                c.name.toLowerCase() === input.trim().toLowerCase()
            );

            if (exactMatch) {
                // Even with exact match, check if there are similar commodities that might need disambiguation
                const similarCommodities = commodities.filter(c =>
                    c.id !== exactMatch.id &&
                    (c.name.toLowerCase().includes(input.trim().toLowerCase()) ||
                        this.areCommoditiesSimilar(c.name, exactMatch.name))
                );

                if (similarCommodities.length > 0) {
                    return {
                        isValid: true,
                        message: 'Commodity found, but similar types are available',
                        data: exactMatch,
                        needsDisambiguation: true,
                        alternatives: [exactMatch, ...similarCommodities],
                    };
                }

                return {
                    isValid: true,
                    message: 'Commodity validated',
                    data: exactMatch,
                };
            }

            // Check for disambiguation needs based on commodity types
            const needsDisambiguation = this.checkIfDisambiguationNeeded(commodities, input.trim());

            if (needsDisambiguation) {
                return {
                    isValid: false,
                    message: 'Multiple commodity types found. Please select the specific type:',
                    needsDisambiguation: true,
                    alternatives: commodities,
                    data: commodities,
                };
            }

            // Single match or clear best match
            const bestMatch = commodities[0];
            return {
                isValid: true,
                message: 'Commodity found',
                data: bestMatch,
            };

        } catch (error) {
            console.error('Error validating commodity:', error);
            return {
                isValid: false,
                message: 'Error validating commodity. Please try again.',
            };
        }
    }

    /**
     * Check if commodities are similar enough to warrant disambiguation
     */
    private areCommoditiesSimilar(name1: string, name2: string): boolean {
        const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n1 = normalize(name1);
        const n2 = normalize(name2);

        // Check if one contains the other or they share significant common words
        return n1.includes(n2) || n2.includes(n1) || this.shareCommonWords(n1, n2);
    }

    /**
     * Check if two strings share common significant words
     */
    private shareCommonWords(str1: string, str2: string): boolean {
        const words1 = str1.split(/\s+/).filter(w => w.length > 2);
        const words2 = str2.split(/\s+/).filter(w => w.length > 2);

        return words1.some(w1 => words2.some(w2 => w1.includes(w2) || w2.includes(w1)));
    }

    /**
     * Determine if disambiguation is needed based on commodity types
     */
    private checkIfDisambiguationNeeded(commodities: Commodity[], input: string): boolean {
        if (commodities.length <= 1) return false;

        // Check if there are different types for similar names
        const types = new Set(commodities.map(c => c.type).filter(Boolean));
        const names = commodities.map(c => c.name.toLowerCase());

        // If multiple types exist and names are similar, disambiguation is needed
        if (types.size > 1) {
            const inputLower = input.toLowerCase();
            const similarNames = names.filter(name =>
                name.includes(inputLower) || inputLower.includes(name)
            );

            return similarNames.length > 1;
        }

        // If more than 3 results, likely needs disambiguation
        return commodities.length > 3;
    }

    /**
     * Validate state selection
     */
    async validateStateSelection(state: string): Promise<ValidationResult> {
        try {
            if (!state || state.trim().length === 0) {
                return {
                    isValid: false,
                    message: 'State selection is required',
                };
            }

            // Try to find by abbreviation first
            let stateData = await supabaseService.getStateByAbbreviation(state.trim());

            if (!stateData) {
                // Try to find by name
                const states = await supabaseService.getStates();
                stateData = states.find(s =>
                    s.name.toLowerCase() === state.trim().toLowerCase()
                );
            }

            if (!stateData) {
                const allStates = await supabaseService.getStates();
                const suggestions = allStates.map(s => `${s.name} (${s.abbreviation})`);

                return {
                    isValid: false,
                    message: 'Invalid state selection',
                    suggestions,
                };
            }

            return {
                isValid: true,
                message: 'State validated',
                data: stateData,
            };
        } catch (error) {
            console.error('Error validating state:', error);
            return {
                isValid: false,
                message: 'Error validating state. Please try again.',
            };
        }
    }

    /**
     * Validate form completion for compliance checking
     */
    async validateFormCompletion(data: {
        commodity?: Commodity;
        originState?: State;
        destinationState?: State;
    }): Promise<ValidationResult> {
        const errors: string[] = [];

        if (!data.commodity) {
            errors.push('Commodity is required');
        }

        if (!data.originState) {
            errors.push('Origin state is required');
        }

        if (!data.destinationState) {
            errors.push('Destination state is required');
        }

        if (data.originState && data.destinationState &&
            data.originState.id === data.destinationState.id) {
            errors.push('Origin and destination states cannot be the same');
        }

        if (errors.length > 0) {
            return {
                isValid: false,
                message: errors.join(', '),
            };
        }

        return {
            isValid: true,
            message: 'Form data is complete and valid',
            data,
        };
    }

    /**
     * Validate commodity type disambiguation
     */
    validateCommodityType(selectedType: string, availableTypes: Commodity[]): ValidationResult {
        if (!selectedType || selectedType.trim().length === 0) {
            return {
                isValid: false,
                message: 'Commodity type selection is required',
            };
        }

        const matchingType = availableTypes.find(type =>
            type.name === selectedType || type.id.toString() === selectedType
        );

        if (!matchingType) {
            return {
                isValid: false,
                message: 'Invalid commodity type selection',
                suggestions: availableTypes.map(t => t.name),
            };
        }

        return {
            isValid: true,
            message: 'Commodity type validated',
            data: matchingType,
        };
    }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;
