// Database entity interfaces for Supabase integration

export interface Commodity {
    id: number;
    name: string;
    type: string;
    created_at?: string;
    updated_at?: string;
}

export interface Pest {
    pest_id: number;
    name: string;
    acronym: string;
    created_at?: string;
    updated_at?: string;
}

export interface PestPresence {
    id?: number;
    pest_id: number;
    state_id: number;
    zoned: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ImportRequirement {
    id: number;
    name: string;
    description: string;
    code?: string;
    source_regulation?: string;
    created_at?: string;
    updated_at?: string;
}

export interface State {
    id: number;
    name: string;
    abbreviation: string;
    created_at?: string;
    updated_at?: string;
}

export interface CommodityPest {
    id?: number;
    commodity_id: number;
    pest_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface CommodityImportRequirement {
    id?: number;
    commodity_id: number;
    import_requirement_id: number;
    created_at?: string;
    updated_at?: string;
}

// Composite types for service responses
export interface CommodityWithPests extends Commodity {
    pests?: Pest[];
}

export interface PestWithPresence extends Pest {
    presence?: PestPresence[];
}

export interface ImportRequirementWithDetails extends ImportRequirement {
    applicable?: boolean;
    reason?: string;
    actions?: string[];
}

// Database configuration interface
export interface DatabaseConfig {
    url: string;
    anonKey: string;
}
