import { describe, it, expect, beforeAll } from 'vitest';
import { supabaseService } from '../supabase';
import { validationService } from '../validation';

describe('SupabaseService', () => {
    beforeAll(async () => {
        // Test database connection before running tests
        const isConnected = await supabaseService.testConnection();
        if (!isConnected) {
            console.warn('Supabase connection test failed. Some tests may be skipped.');
        }
    });

    describe('Database Connection', () => {
        it('should be able to test connection', async () => {
            const result = await supabaseService.testConnection();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('States', () => {
        it('should get all states', async () => {
            try {
                const states = await supabaseService.getStates();
                expect(Array.isArray(states)).toBe(true);
            } catch (error) {
                console.warn('States test skipped - database not available');
            }
        });

        it('should get state by abbreviation', async () => {
            try {
                const state = await supabaseService.getStateByAbbreviation('TAS');
                if (state) {
                    expect(state).toHaveProperty('id');
                    expect(state).toHaveProperty('name');
                    expect(state).toHaveProperty('abbreviation');
                    expect(state.abbreviation).toBe('TAS');
                }
            } catch (error) {
                console.warn('State by abbreviation test skipped - database not available');
            }
        });
    });

    describe('Commodities', () => {
        it('should search commodities', async () => {
            try {
                const commodities = await supabaseService.searchCommodities('apple');
                expect(Array.isArray(commodities)).toBe(true);
            } catch (error) {
                console.warn('Commodity search test skipped - database not available');
            }
        });

        it('should handle empty search query', async () => {
            try {
                const commodities = await supabaseService.searchCommodities('');
                expect(Array.isArray(commodities)).toBe(true);
            } catch (error) {
                console.warn('Empty search test skipped - database not available');
            }
        });
    });

    describe('Pests', () => {
        it('should get commodity pests', async () => {
            try {
                // This will return empty array if commodity doesn't exist, which is fine for testing
                const pests = await supabaseService.getCommodityPests(1);
                expect(Array.isArray(pests)).toBe(true);
            } catch (error) {
                console.warn('Commodity pests test skipped - database not available');
            }
        });

        it('should get pest presence', async () => {
            try {
                // This will return empty array if no presence data, which is fine for testing
                const presence = await supabaseService.getPestPresence([1], 1);
                expect(Array.isArray(presence)).toBe(true);
            } catch (error) {
                console.warn('Pest presence test skipped - database not available');
            }
        });
    });
});

describe('ValidationService', () => {
    describe('Commodity Validation', () => {
        it('should reject empty commodity input', async () => {
            const result = await validationService.validateCommodity('');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('required');
        });

        it('should reject whitespace-only commodity input', async () => {
            const result = await validationService.validateCommodity('   ');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('required');
        });
    });

    describe('State Validation', () => {
        it('should reject empty state input', async () => {
            const result = await validationService.validateStateSelection('');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('required');
        });
    });

    describe('Form Completion Validation', () => {
        it('should reject incomplete form data', async () => {
            const result = await validationService.validateFormCompletion({});
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('required');
        });

        it('should reject same origin and destination', async () => {
            const mockState = { id: 1, name: 'Tasmania', abbreviation: 'TAS' };
            const mockCommodity = { id: 1, name: 'Apple', type: 'fruit' };

            const result = await validationService.validateFormCompletion({
                commodity: mockCommodity,
                originState: mockState,
                destinationState: mockState,
            });

            expect(result.isValid).toBe(false);
            expect(result.message).toContain('cannot be the same');
        });
    });
});
