import { supabase } from '@/config/supabase';
import type {
    Commodity,
    Pest,
    PestPresence,
    ImportRequirement,
    State,
    CommodityPest,
    CommodityImportRequirement,
    CommodityWithPests,
    PestWithPresence,
} from '@/types/database';

export class SupabaseService {
    /**
     * Search commodities by name with fuzzy matching
     */
    async searchCommodities(query: string): Promise<Commodity[]> {
        try {
            const { data, error } = await supabase
                .from('commodity')
                .select('commodity_id, name, type')
                .ilike('name', `%${query}%`)
                .order('name');

            if (error) {
                console.error('Error searching commodities:', error);
                throw new Error(`Failed to search commodities: ${error.message}`);
            }

            // Map database columns to interface
            return (data || []).map(item => ({
                id: item.commodity_id,
                name: item.name,
                type: item.type
            }));
        } catch (error) {
            console.error('Error in searchCommodities:', error);
            throw error;
        }
    }

    /**
     * Get a specific commodity by ID
     */
    async getCommodityById(id: number): Promise<Commodity | null> {
        try {
            const { data, error } = await supabase
                .from('commodity')
                .select('commodity_id, name, type')
                .eq('commodity_id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // No rows returned
                }
                console.error('Error getting commodity by ID:', error);
                throw new Error(`Failed to get commodity: ${error.message}`);
            }

            // Map database columns to interface
            return data ? {
                id: data.commodity_id,
                name: data.name,
                type: data.type
            } : null;
        } catch (error) {
            console.error('Error in getCommodityById:', error);
            throw error;
        }
    }

    /**
     * Get all pests associated with a commodity
     */
    async getCommodityPests(commodityId: number): Promise<Pest[]> {
        try {
            const { data, error } = await supabase
                .from('commodity_pest')
                .select(`
          pest_id,
          pest:pest_id (
            pest_id,
            name,
            acronym
          )
        `)
                .eq('commodity_id', commodityId);

            if (error) {
                console.error('Error getting commodity pests:', error);
                throw new Error(`Failed to get commodity pests: ${error.message}`);
            }

            // Extract pest data from the joined result
            return (data || [])
                .map(item => item.pest)
                .filter(pest => pest !== null) as Pest[];
        } catch (error) {
            console.error('Error in getCommodityPests:', error);
            throw error;
        }
    }

    /**
     * Check pest presence in specific states
     */
    async getPestPresence(pestIds: number[], stateId: number): Promise<PestPresence[]> {
        try {
            const { data, error } = await supabase
                .from('pest_state')
                .select('*')
                .in('pest_id', pestIds)
                .eq('state_id', stateId);

            if (error) {
                console.error('Error getting pest presence:', error);
                throw new Error(`Failed to get pest presence: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error in getPestPresence:', error);
            throw error;
        }
    }

    /**
     * Get import requirements for a commodity
     */
    async getImportRequirements(commodityId: number): Promise<ImportRequirement[]> {
        try {
            const { data, error } = await supabase
                .from('commodity_import_requirement')
                .select(`
          import_requirement_id,
          import_requirement:import_requirement_id (
            import_requirement_id,
            name,
            content,
            number
          )
        `)
                .eq('commodity_id', commodityId);

            if (error) {
                console.error('Error getting import requirements:', error);
                throw new Error(`Failed to get import requirements: ${error.message}`);
            }

            // Extract requirement data from the joined result and map to interface
            const requirements = (data || [])
                .map(item => item.import_requirement)
                .filter(req => req !== null)
                .map(req => ({
                    id: req.import_requirement_id,
                    name: req.name,
                    description: req.content || '', // Map content to description
                    code: req.number || '', // Map number to code
                    source_regulation: 'Biosecurity regulations', // Default value since not in DB
                })) as ImportRequirement[];

            // If no specific requirements found, return some general fruit fly requirements for demo
            if (requirements.length === 0) {
                console.log('No specific commodity requirements found, returning general fruit fly requirements for demo');
                return await this.getGeneralFruitFlyRequirements();
            }

            return requirements;
        } catch (error) {
            console.error('Error in getImportRequirements:', error);
            throw error;
        }
    }

    /**
     * Get general fruit fly requirements for demo purposes when no specific commodity requirements exist
     */
    private async getGeneralFruitFlyRequirements(): Promise<ImportRequirement[]> {
        try {
            const { data, error } = await supabase
                .from('import_requirement')
                .select('import_requirement_id, name, content, number')
                .limit(5);

            if (error) {
                console.error('Error getting general requirements:', error);
                return [];
            }

            return (data || []).map(req => ({
                id: req.import_requirement_id,
                name: req.name,
                description: req.content || '',
                code: req.number || '',
                source_regulation: 'Plant Biosecurity Manual Tasmania',
            }));
        } catch (error) {
            console.error('Error in getGeneralFruitFlyRequirements:', error);
            return [];
        }
    }

    /**
     * Get all states
     */
    async getStates(): Promise<State[]> {
        try {
            const { data, error } = await supabase
                .from('state')
                .select('state_id, name')
                .order('name');

            if (error) {
                console.error('Error getting states:', error);
                throw new Error(`Failed to get states: ${error.message}`);
            }

            // Map database columns to interface
            return (data || []).map(state => ({
                id: state.state_id,
                name: state.name,
                abbreviation: state.name, // Use name as abbreviation since abbreviation column doesn't exist
            }));
        } catch (error) {
            console.error('Error in getStates:', error);
            throw error;
        }
    }

    /**
     * Get a state by ID
     */
    async getStateById(id: number): Promise<State | null> {
        try {
            const { data, error } = await supabase
                .from('state')
                .select('state_id, name')
                .eq('state_id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // No rows returned
                }
                console.error('Error getting state by ID:', error);
                throw new Error(`Failed to get state: ${error.message}`);
            }

            // Map database columns to interface
            return data ? {
                id: data.state_id,
                name: data.name,
                abbreviation: data.name,
            } : null;
        } catch (error) {
            console.error('Error in getStateById:', error);
            throw error;
        }
    }

    /**
     * Get a state by abbreviation (e.g., 'TAS', 'NSW')
     * Note: Falls back to name matching if abbreviation column doesn't exist
     */
    async getStateByAbbreviation(abbreviation: string): Promise<State | null> {
        try {
            // Since abbreviation column doesn't exist, match by name directly
            const states = await this.getStates();
            const matchedState = states.find(state =>
                state.name.toUpperCase().includes(abbreviation.toUpperCase()) ||
                state.name.toLowerCase() === this.getFullStateName(abbreviation).toLowerCase()
            );
            return matchedState || null;
        } catch (error) {
            console.error('Error in getStateByAbbreviation:', error);
            throw error;
        }
    }

    /**
     * Helper method to convert abbreviation to full state name
     */
    private getFullStateName(abbreviation: string): string {
        const stateMap: Record<string, string> = {
            'QLD': 'Queensland',
            'NSW': 'New South Wales',
            'VIC': 'Victoria',
            'SA': 'South Australia',
            'WA': 'Western Australia',
            'TAS': 'Tasmania',
            'NT': 'Northern Territory',
            'ACT': 'Australian Capital Territory',
        };
        return stateMap[abbreviation.toUpperCase()] || abbreviation;
    }

    /**
     * Get pest information by IDs
     */
    async getPestsByIds(pestIds: number[]): Promise<Pest[]> {
        try {
            const { data, error } = await supabase
                .from('pest')
                .select('*')
                .in('pest_id', pestIds);

            if (error) {
                console.error('Error getting pests by IDs:', error);
                throw new Error(`Failed to get pests: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error in getPestsByIds:', error);
            throw error;
        }
    }

    /**
     * Comprehensive commodity search with pest information
     */
    async searchCommoditiesWithPests(query: string): Promise<CommodityWithPests[]> {
        try {
            const commodities = await this.searchCommodities(query);

            const commoditiesWithPests = await Promise.all(
                commodities.map(async (commodity) => {
                    const pests = await this.getCommodityPests(commodity.id);
                    return {
                        ...commodity,
                        pests,
                    };
                })
            );

            return commoditiesWithPests;
        } catch (error) {
            console.error('Error in searchCommoditiesWithPests:', error);
            throw error;
        }
    }

    /**
     * Get comprehensive pest information including presence data
     */
    async getPestsWithPresence(pestIds: number[], stateId: number): Promise<PestWithPresence[]> {
        try {
            const [pests, presenceData] = await Promise.all([
                this.getPestsByIds(pestIds),
                this.getPestPresence(pestIds, stateId),
            ]);

            return pests.map(pest => ({
                ...pest,
                presence: presenceData.filter(p => p.pest_id === pest.pest_id),
            }));
        } catch (error) {
            console.error('Error in getPestsWithPresence:', error);
            throw error;
        }
    }

    /**
     * Test database connection
     */
    async testConnection(): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('state')
                .select('count')
                .limit(1);

            if (error) {
                console.error('Database connection test failed:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Database connection test error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
export default supabaseService;
